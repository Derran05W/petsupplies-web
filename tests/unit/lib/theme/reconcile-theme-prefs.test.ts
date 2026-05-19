import { describe, expect, it } from 'vitest';
import {
  reconcileThemePreferences,
  themePrefsNeedsMetadataSync,
} from '@/lib/theme/reconcile-theme-prefs';

describe('reconcileThemePreferences', () => {
  it('prefers localStorage when it differs from metadata', () => {
    expect(
      reconcileThemePreferences(
        { theme_prefs: { appearance: 'light' } },
        { appearance: 'tropical' },
      ),
    ).toEqual({ appearance: 'tropical' });
  });

  it('uses metadata when localStorage is absent', () => {
    expect(
      reconcileThemePreferences({ theme_prefs: { appearance: 'dark' } }, null),
    ).toEqual({ appearance: 'dark' });
  });

  it('uses localStorage when metadata has no theme_prefs', () => {
    expect(
      reconcileThemePreferences({ name: 'Pat' }, { appearance: 'tropical' }),
    ).toEqual({ appearance: 'tropical' });
  });

  it('uses metadata when localStorage absent (fresh device, tropical)', () => {
    expect(
      reconcileThemePreferences(
        { theme_prefs: { appearance: 'tropical' } },
        null,
      ),
    ).toEqual({ appearance: 'tropical' });
  });

  it('uses metadata after localStorage cleared (null storage)', () => {
    expect(
      reconcileThemePreferences({ theme_prefs: { appearance: 'light' } }, null),
    ).toEqual({ appearance: 'light' });
  });
});

describe('themePrefsNeedsMetadataSync', () => {
  it('returns false when appearances already match', () => {
    expect(
      themePrefsNeedsMetadataSync(
        { theme_prefs: { appearance: 'tropical' } },
        { appearance: 'tropical' },
      ),
    ).toBe(false);
  });

  it('returns true when appearances differ', () => {
    expect(
      themePrefsNeedsMetadataSync(
        { theme_prefs: { appearance: 'light' } },
        { appearance: 'tropical' },
      ),
    ).toBe(true);
  });

  it('returns false when appearances match', () => {
    expect(
      themePrefsNeedsMetadataSync(
        { theme_prefs: { appearance: 'light' } },
        { appearance: 'light' },
      ),
    ).toBe(false);
  });
});
