import { describe, expect, it } from 'vitest';
import { parseThemePreferencesFromMetadata } from '@/lib/theme/parse-theme-prefs';

describe('theme metadata sync', () => {
  it('defaults to light when theme_prefs is absent', () => {
    expect(parseThemePreferencesFromMetadata({ name: 'Pat' })).toEqual({
      appearance: 'light',
    });
  });

  it('parses tropical from saved theme_prefs', () => {
    expect(
      parseThemePreferencesFromMetadata({
        theme_prefs: { appearance: 'tropical' },
      }),
    ).toEqual({ appearance: 'tropical' });
  });
});
