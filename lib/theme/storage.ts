import { DEFAULT_THEME_PREFERENCES } from './defaults';
import { parseThemePreferences } from './parse-theme-prefs';
import { THEME_STORAGE_KEY, type ThemePreferences } from './types';

export function readThemeFromStorage(): ThemePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    return parseThemePreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeThemeToStorage(prefs: ThemePreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private mode */
  }
}

export function readThemeFromStorageOrDefault(): ThemePreferences {
  return readThemeFromStorage() ?? { ...DEFAULT_THEME_PREFERENCES };
}
