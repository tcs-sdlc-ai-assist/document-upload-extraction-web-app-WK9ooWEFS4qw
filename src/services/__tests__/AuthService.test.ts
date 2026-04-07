import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../AuthService';
import { STORAGE_KEYS } from '../../constants';

describe('AuthService', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    });
  });

  describe('signup', () => {
    it('should create a new user with valid credentials', async () => {
      const result = await AuthService.signup('testuser', 'Password1');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.username).toBe('testuser');
      expect(result.token).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should store the user in localStorage after signup', async () => {
      await AuthService.signup('testuser', 'Password1');

      const usersRaw = store[STORAGE_KEYS.USERS];
      expect(usersRaw).toBeDefined();
      const users = JSON.parse(usersRaw);
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('testuser');
    });

    it('should reject signup with a duplicate username', async () => {
      const first = await AuthService.signup('testuser', 'Password1');
      expect(first.success).toBe(true);

      const second = await AuthService.signup('testuser', 'Password2');
      expect(second.success).toBe(false);
      expect(second.error).toBeDefined();
    });

    it('should hash the password and not store it in plain text', async () => {
      await AuthService.signup('testuser', 'Password1');

      const usersRaw = store[STORAGE_KEYS.USERS];
      const users = JSON.parse(usersRaw);
      expect(users[0].passwordHash).toBeDefined();
      expect(users[0].passwordHash).not.toBe('Password1');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthService.signup('loginuser', 'Password1');
    });

    it('should login with correct credentials', async () => {
      const result = await AuthService.login('loginuser', 'Password1');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.username).toBe('loginuser');
      expect(result.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const result = await AuthService.login('loginuser', 'WrongPass1');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.user).toBeUndefined();
    });

    it('should reject login with non-existent username', async () => {
      const result = await AuthService.login('nonexistent', 'Password1');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should store session in localStorage after login', async () => {
      await AuthService.login('loginuser', 'Password1');

      const sessionRaw = store[STORAGE_KEYS.SESSION];
      expect(sessionRaw).toBeDefined();
      const session = JSON.parse(sessionRaw);
      expect(session.isAuthenticated).toBe(true);
      expect(session.user).toBeDefined();
      expect(session.sessionToken).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should clear session on logout', async () => {
      await AuthService.signup('logoutuser', 'Password1');
      await AuthService.login('logoutuser', 'Password1');

      const sessionBefore = store[STORAGE_KEYS.SESSION];
      expect(sessionBefore).toBeDefined();

      AuthService.logout();

      const sessionAfter = store[STORAGE_KEYS.SESSION];
      expect(sessionAfter).toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user when logged in', async () => {
      await AuthService.signup('currentuser', 'Password1');
      await AuthService.login('currentuser', 'Password1');

      const currentUser = AuthService.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser!.username).toBe('currentuser');
    });

    it('should return null when no session exists', () => {
      const currentUser = AuthService.getCurrentUser();
      expect(currentUser).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is logged in', async () => {
      await AuthService.signup('authuser', 'Password1');
      await AuthService.login('authuser', 'Password1');

      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it('should return false when no session exists', () => {
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    it('should return false after logout', async () => {
      await AuthService.signup('authuser2', 'Password1');
      await AuthService.login('authuser2', 'Password1');

      expect(AuthService.isAuthenticated()).toBe(true);

      AuthService.logout();

      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });
});