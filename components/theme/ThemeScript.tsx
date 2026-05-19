import { THEME_INIT_SCRIPT } from '@/lib/theme/theme-init-script';

/**
 * Runs before paint to avoid a flash of the wrong theme. First child of
 * `<body>` — do not place in a manual `<head>` (breaks Next.js hydration).
 */
export function ThemeScript() {
  return (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
