import type { Appearance, ResolvedTheme } from './types';

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Maps stored appearance + OS preference to the active `data-theme` value. */
export function resolveTheme(
  appearance: Appearance,
  prefersDark: boolean,
): ResolvedTheme {
  if (appearance === 'tropical') return 'tropical';
  if (appearance === 'dark') return 'dark';
  if (appearance === 'light') return 'light';
  return prefersDark ? 'dark' : 'light';
}

/** For `color-scheme` CSS property (tropical uses light chrome). */
export function resolvedThemeColorScheme(
  resolved: ResolvedTheme,
): 'light' | 'dark' {
  return resolved === 'dark' ? 'dark' : 'light';
}
