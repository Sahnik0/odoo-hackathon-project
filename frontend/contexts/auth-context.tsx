'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setAccessToken } from '@/lib/token-store';
import { loginRequest, logoutRequest, refreshSessionRequest, setRoleRequest } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: { email: string; password: string; rememberMe?: boolean }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateRole: (role: 'EMPLOYEE' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await refreshSessionRequest();
        if (cancelled) return;
        setAccessToken(result.accessToken);
        setUser(result.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function login(input: { email: string; password: string; rememberMe?: boolean }) {
    const result = await loginRequest(input);
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  async function updateRole(role: 'EMPLOYEE' | 'ADMIN') {
    await setRoleRequest(role);
    setUser((prev) => prev ? { ...prev, role } : prev);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
