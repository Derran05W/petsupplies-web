import { describe, expect, it } from 'vitest';
import { parseThemePreferences } from '@/lib/theme/parse-theme-prefs';
import { resolveTheme } from '@/lib/theme/resolve-theme';

describe('parseThemePreferences', () => {
  it('returns defaults for invalid input', () => {
    expect(parseThemePreferences(null)).toEqual({
      appearance: 'light',
    });
  });

  it('parses valid appearance', () => {
    expect(parseThemePreferences({ appearance: 'tropical' })).toEqual({
      appearance: 'tropical',
    });
  });

  it('migrates legacy colorMode', () => {
    expect(
      parseThemePreferences({ colorMode: 'dark', palette: 'ocean' }),
    ).toEqual({
      appearance: 'dark',
    });
  });

  it('rejects unknown values', () => {
    expect(
      parseThemePreferences({ appearance: 'neon', colorMode: 'chartreuse' }),
    ).toEqual({
      appearance: 'light',
    });
  });
});

describe('resolveTheme', () => {
  it('respects system preference flag', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('pins light, dark, and tropical', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('tropical', true)).toBe('tropical');
    expect(resolveTheme('tropical', false)).toBe('tropical');
  });
});
