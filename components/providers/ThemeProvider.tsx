'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { applyThemeToDocument } from '@/lib/theme/apply-theme';
import { DEFAULT_THEME_PREFERENCES } from '@/lib/theme/defaults';
import {
  reconcileThemePreferences,
  themePrefsNeedsMetadataSync,
} from '@/lib/theme/reconcile-theme-prefs';
import { getSystemPrefersDark, resolveTheme } from '@/lib/theme/resolve-theme';
import {
  readThemeFromStorage,
  readThemeFromStorageOrDefault,
  writeThemeToStorage,
} from '@/lib/theme/storage';
import type { ResolvedTheme, ThemePreferences } from '@/lib/theme/types';

interface ThemeContextValue {
  preferences: ThemePreferences;
  resolvedTheme: ResolvedTheme;
  setPreferences: (next: ThemePreferences) => Promise<void>;
  saving: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialPreferences?: ThemePreferences;
}

export function ThemeProvider({
  children,
  initialPreferences,
}: ThemeProviderProps) {
  const { user, refreshUser } = useAuth();

  const [preferences, setPreferencesState] = useState<ThemePreferences>(
    () => initialPreferences ?? { ...DEFAULT_THEME_PREFERENCES },
  );

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  const [saving, setSaving] = useState(false);

  const apply = useCallback((prefs: ThemePreferences) => {
    const prefersDark = getSystemPrefersDark();
    const resolved = resolveTheme(prefs.appearance, prefersDark);
    applyThemeToDocument(prefs.appearance, resolved);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    const stored = readThemeFromStorageOrDefault();
    setPreferencesState(stored);
    apply(stored);
  }, [apply]);

  useEffect(() => {
    if (initialPreferences) {
      setPreferencesState(initialPreferences);
      writeThemeToStorage(initialPreferences);
      apply(initialPreferences);
    }
  }, [initialPreferences, apply]);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata as Record<string, unknown>;
    const stored = readThemeFromStorage();
    const prefs = reconcileThemePreferences(meta, stored);
    setPreferencesState(prefs);
    writeThemeToStorage(prefs);
    apply(prefs);

    if (!themePrefsNeedsMetadataSync(meta, prefs)) return;

    void (async () => {
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({ data: { theme_prefs: prefs } });
      } catch {
        /* offline / session — localStorage still holds the choice */
      }
    })();
    // keyed on user?.id deliberately: the user object's identity churns on
    // every token refresh, and reconciliation must run once per sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, apply]);

  useEffect(() => {
    if (preferences.appearance !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function onChange() {
      apply(preferences);
    }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preferences, apply]);

  const setPreferences = useCallback(
    async (next: ThemePreferences) => {
      setPreferencesState(next);
      writeThemeToStorage(next);
      apply(next);

      setSaving(true);
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!currentUser) return;

        await supabase.auth.updateUser({
          data: { theme_prefs: next },
        });
        await refreshUser();
      } finally {
        setSaving(false);
      }
    },
    [apply, refreshUser],
  );

  const value = useMemo(
    () => ({
      preferences,
      resolvedTheme,
      setPreferences,
      saving,
    }),
    [preferences, resolvedTheme, setPreferences, saving],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
