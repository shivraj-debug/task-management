'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types';
import { loginApi, registerApi, logoutApi, getMeApi } from '@/lib/auth-api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_CACHE_KEY = 'tf_user';

const AUTH_PAGES = ['/auth/login', '/auth/register'];

function getCachedUser(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  try {
    if (user) sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(USER_CACHE_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    return getCachedUser();
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return getCachedUser() === null;
  });
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    // Don't validate session on login/register pages — causes the loop
    if (isAuthPage) {
      setIsLoading(false);
      return;
    }

    getMeApi()
      .then((freshUser) => {
        setUser(freshUser);
        setCachedUser(freshUser);
      })
      .catch(() => {
        setUser(null);
        setCachedUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthPage]);

  const login = useCallback(async (email: string, password: string) => {
    const freshUser = await loginApi({ email, password });
    setCachedUser(freshUser);
    setUser(freshUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const freshUser = await registerApi({ name, email, password });
    setCachedUser(freshUser);
    setUser(freshUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {}
    setCachedUser(null);
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}