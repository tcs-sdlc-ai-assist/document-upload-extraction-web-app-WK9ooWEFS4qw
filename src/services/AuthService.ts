import { STORAGE_KEYS, VALIDATION_PATTERNS } from '../constants';
import { User, AuthState } from '../types';

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
}

async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `fallback-${Math.abs(hash).toString(16)}`;
  }
}

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getSession(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

function saveSession(session: AuthState): void {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export const AuthService = {
  async signup(username: string, password: string): Promise<AuthResult> {
    if (!username || username.trim().length === 0) {
      return { success: false, error: 'Name is required.' };
    }

    if (!VALIDATION_PATTERNS.NAME.test(username.trim())) {
      return { success: false, error: 'Name must be 2-50 characters, letters only.' };
    }

    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
      return {
        success: false,
        error: 'Password must be at least 8 characters with one uppercase letter, one lowercase letter, and one number.',
      };
    }

    const users = getUsers();
    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = users.find(
      (u) => u.username.toLowerCase() === normalizedUsername
    );

    if (existingUser) {
      return { success: false, error: 'An account with this username already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: generateId(),
      username: username.trim(),
      passwordHash,
    };

    users.push(newUser);
    saveUsers(users);

    const token = generateToken();
    const session: AuthState = {
      user: newUser,
      isAuthenticated: true,
      sessionToken: token,
    };
    saveSession(session);

    return { success: true, user: newUser, token };
  },

  async login(username: string, password: string): Promise<AuthResult> {
    if (!username || username.trim().length === 0) {
      return { success: false, error: 'Username is required.' };
    }

    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const users = getUsers();
    const normalizedUsername = username.trim().toLowerCase();

    const user = users.find(
      (u) => u.username.toLowerCase() === normalizedUsername
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const passwordHash = await hashPassword(password);

    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const token = generateToken();
    const session: AuthState = {
      user,
      isAuthenticated: true,
      sessionToken: token,
    };
    saveSession(session);

    return { success: true, user, token };
  },

  logout(): void {
    clearSession();
  },

  getCurrentUser(): User | null {
    const session = getSession();
    if (!session || !session.isAuthenticated || !session.user) {
      return null;
    }
    return session.user;
  },

  getSession(): AuthState | null {
    return getSession();
  },

  isAuthenticated(): boolean {
    const session = getSession();
    return session !== null && session.isAuthenticated === true && session.user !== null && session.sessionToken !== null;
  },

  getToken(): string | null {
    const session = getSession();
    if (!session || !session.isAuthenticated) {
      return null;
    }
    return session.sessionToken;
  },
};