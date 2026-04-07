import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthService, AuthResult } from '../services/AuthService';
import type { User, AuthState, StatusMessage, StatusMessageType } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sessionToken: string | null;
  loading: boolean;
  statusMessage: StatusMessage | null;
  login: (username: string, password: string) => Promise<AuthResult>;
  signup: (username: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  clearStatusMessage: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function createStatusMessage(text: string, type: StatusMessageType): StatusMessage {
  return {
    id: generateMessageId(),
    text,
    type,
    timestamp: Date.now(),
  };
}

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  useEffect(() => {
    try {
      const session: AuthState | null = AuthService.getSession();
      if (session && session.isAuthenticated && session.user && session.sessionToken) {
        setUser(session.user);
        setSessionToken(session.sessionToken);
        setIsAuthenticated(true);
      }
    } catch (_error) {
      setUser(null);
      setSessionToken(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    try {
      const result = await AuthService.login(username, password);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setSessionToken(result.token);
        setIsAuthenticated(true);
        setStatusMessage(createStatusMessage('Logged in successfully.', 'success'));
      } else {
        setStatusMessage(createStatusMessage(result.error || 'Invalid email or password.', 'error'));
      }
      return result;
    } catch (_error) {
      const errorMessage = 'An unexpected error occurred during login.';
      setStatusMessage(createStatusMessage(errorMessage, 'error'));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    try {
      const result = await AuthService.signup(username, password);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setSessionToken(result.token);
        setIsAuthenticated(true);
        setStatusMessage(createStatusMessage('Account created successfully.', 'success'));
      } else {
        setStatusMessage(createStatusMessage(result.error || 'An error occurred during signup.', 'error'));
      }
      return result;
    } catch (_error) {
      const errorMessage = 'An unexpected error occurred during signup.';
      setStatusMessage(createStatusMessage(errorMessage, 'error'));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    try {
      AuthService.logout();
    } catch (_error) {
      // Continue with local state cleanup even if storage fails
    }
    setUser(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    setStatusMessage(createStatusMessage('Logged out successfully.', 'info'));
  }, []);

  const clearStatusMessage = useCallback(() => {
    setStatusMessage(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    sessionToken,
    loading,
    statusMessage,
    login,
    signup,
    logout,
    clearStatusMessage,
  }), [user, isAuthenticated, sessionToken, loading, statusMessage, login, signup, logout, clearStatusMessage]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}

export default AuthContext;