import type { Appearance, ResolvedTheme } from './types';
import { resolvedThemeColorScheme } from './resolve-theme';

export function applyThemeToDocument(
  _appearance: Appearance,
  resolved: ResolvedTheme,
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolvedThemeColorScheme(resolved);
}
