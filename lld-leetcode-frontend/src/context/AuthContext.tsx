import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  setAccessToken,
} from '../services/api';

type AuthUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const refreshResponse = await refreshSession();
        const refreshedToken = refreshResponse?.data?.accessToken ?? null;
        const refreshedUser = refreshResponse?.data?.user ?? null;
        setAccessToken(refreshedToken);

        if (!refreshedToken) {
          setUser(null);
          return;
        }

        // Use user from refresh response directly (avoids extra getMe call and race conditions)
        setUser(refreshedUser);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);
    const token = response?.data?.accessToken ?? null;
    const loggedInUser = response?.data?.user ?? null;
    setAccessToken(token);
    setUser(loggedInUser);
  };

  const register = async (email: string, password: string) => {
    await registerUser(email, password);
    await login(email, password);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
