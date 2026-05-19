import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
        },
        warm: {
          50: 'var(--color-warm-50)',
          100: 'var(--color-warm-100)',
          200: 'var(--color-warm-200)',
          300: 'var(--color-warm-300)',
          400: 'var(--color-warm-400)',
          600: 'var(--color-warm-600)',
          900: 'var(--color-warm-900)',
        },
        surface: {
          card: 'var(--color-surface-card)',
          drawer: 'var(--color-surface-drawer)',
        },
        overlay: 'var(--color-surface-overlay)',
        danger: {
          surface: 'var(--color-danger-surface)',
          border: 'var(--color-danger-border)',
          solid: 'var(--color-danger-solid)',
          'solid-hover': 'var(--color-danger-solid-hover)',
          'on-solid': 'var(--color-danger-on-solid)',
        },
      },
      letterSpacing: {
        'tight-display': '-0.02em',
        'tighter-display': '-0.03em',
        'wide-label': '0.08em',
      },
    },
  },
  plugins: [],
};

export default config;
