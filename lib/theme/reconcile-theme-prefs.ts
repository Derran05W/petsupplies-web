import { DEFAULT_THEME_PREFERENCES } from './defaults';
import {
  parseThemePreferences,
  parseThemePreferencesFromMetadata,
} from './parse-theme-prefs';
import type { ThemePreferences } from './types';

/**
 * Picks the active theme prefs when both localStorage and Supabase may differ.
 * localStorage wins when it disagrees with metadata (latest UI selection).
 */
export function reconcileThemePreferences(
  meta: Record<string, unknown> | null | undefined,
  stored: ThemePreferences | null,
): ThemePreferences {
  const hasMetaPrefs =
    meta != null &&
    meta['theme_prefs'] != null &&
    typeof meta['theme_prefs'] === 'object';

  const fromMeta = hasMetaPrefs
    ? parseThemePreferencesFromMetadata(meta)
    : null;
  const fromStorage = stored;

  if (fromStorage && fromMeta) {
    return fromStorage.appearance !== fromMeta.appearance
      ? fromStorage
      : fromMeta;
  }
  if (fromStorage) return fromStorage;
  if (fromMeta) return fromMeta;
  return { ...DEFAULT_THEME_PREFERENCES };
}

/** True when metadata should be updated to match reconciled prefs. */
export function themePrefsNeedsMetadataSync(
  meta: Record<string, unknown> | null | undefined,
  prefs: ThemePreferences,
): boolean {
  if (meta?.['theme_prefs'] == null) return true;
  const fromMeta = parseThemePreferences(meta['theme_prefs']);
  return fromMeta.appearance !== prefs.appearance;
}
