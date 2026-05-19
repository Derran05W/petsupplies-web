/** User-selected appearance. `system` follows the device light/dark setting. */
export type Appearance = 'light' | 'dark' | 'system' | 'tropical';

/** Theme applied to the document (`data-theme`). */
export type ResolvedTheme = 'light' | 'dark' | 'tropical';

export interface ThemePreferences {
  appearance: Appearance;
}

export const THEME_STORAGE_KEY = 'app-theme';

export const APPEARANCE_OPTIONS: readonly {
  id: Appearance;
  label: string;
  description: string;
  /** Preview swatches for the settings UI only. */
  preview: readonly string[];
}[] = [
  {
    id: 'light',
    label: 'Light',
    description: 'Warm coral shop theme (default)',
    preview: ['#f16c43', '#fbf8f8', '#612f3a'],
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Warm coral on deep plum tones',
    preview: ['#0f0c0c', '#f16c43', '#f4eced'],
  },
  {
    id: 'system',
    label: 'System',
    description: 'Match your device light or dark setting',
    preview: ['#fbf8f8', '#0f0c0c', '#f16c43'],
  },
  {
    id: 'tropical',
    label: 'Tropical',
    description: 'Coral, sun, teal & sage',
    preview: ['#FCA47C', '#23CED9', '#097C87'],
  },
] as const;
