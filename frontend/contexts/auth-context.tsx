'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setAccessToken } from '@/lib/token-store';
import { loginRequest, logoutRequest, refreshSessionRequest } from '@/services/auth.service';
import type { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  // true while the initial silent-refresh bootstrap is in flight — gates the
  // protected layout so it doesn't flash a redirect before we know the answer.
  isLoading: boolean;
  login: (input: { email: string; password: string; rememberMe?: boolean }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load the access token only lives in memory, so a hard refresh
  // always starts with none — silently try the refresh cookie once to
  // restore the session before deciding whether protected routes redirect.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await refreshSessionRequest();
        if (cancelled) return;
        setAccessToken(result.accessToken);
        setUser(result.user);
      } catch {
        // No valid refresh cookie (never logged in, or it expired/was
        // revoked) — stay logged out, protected routes will redirect.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
