'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Re-fetch user after mutating metadata (theme, profile). */
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchAuthUser(): Promise<User | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const next = await fetchAuthUser();
    setUser(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.refreshSession();
      }
      if (!cancelled) await refreshUser();
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      queueMicrotask(() => {
        void (async () => {
          if (cancelled) return;
          await refreshUser();
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            router.refresh();
          }
        })();
      });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, refreshUser]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/');
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, signOut, refreshUser }),
    [user, loading, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
