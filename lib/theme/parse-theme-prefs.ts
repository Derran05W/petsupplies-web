import { DEFAULT_THEME_PREFERENCES } from './defaults';
import type { Appearance, ThemePreferences } from './types';

const APPEARANCES = new Set<Appearance>([
  'light',
  'dark',
  'system',
  'tropical',
]);

function isAppearance(v: unknown): v is Appearance {
  return typeof v === 'string' && APPEARANCES.has(v as Appearance);
}

/** TODO: remove migrateLegacy after 2026-09-01 if no colorMode telemetry hits. */
function migrateLegacy(raw: Record<string, unknown>): ThemePreferences | null {
  const colorMode = raw['colorMode'];
  if (colorMode === 'light' || colorMode === 'dark' || colorMode === 'system') {
    return { appearance: colorMode };
  }
  return null;
}

export function parseThemePreferences(raw: unknown): ThemePreferences {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_THEME_PREFERENCES };
  }
  const o = raw as Record<string, unknown>;

  if (isAppearance(o['appearance'])) {
    return { appearance: o['appearance'] };
  }

  const legacy = migrateLegacy(o);
  if (legacy) return legacy;

  return { ...DEFAULT_THEME_PREFERENCES };
}

export function parseThemePreferencesFromMetadata(
  meta: Record<string, unknown> | null | undefined,
): ThemePreferences {
  return parseThemePreferences(meta?.['theme_prefs']);
}
