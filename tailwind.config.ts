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
        ink: {
          DEFAULT: 'var(--ink)',
          secondary: 'var(--ink-secondary)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
        paper: 'var(--paper)',
        panel: 'var(--panel)',
        amber: {
          DEFAULT: 'var(--amber)',
          soft: 'var(--amber-soft)',
        },
        slate: {
          DEFAULT: 'var(--slate)',
          soft: 'var(--slate-soft)',
        },
        pine: 'var(--pine)',
        line: 'var(--line)',
        tile: {
          'amber-ink': 'var(--tile-amber-ink)',
          'slate-ink': 'var(--tile-slate-ink)',
          'sage-ink': 'var(--tile-sage-ink)',
          'clay-ink': 'var(--tile-clay-ink)',
        },
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
      fontSize: {
        // display scale — Fraunces, weight 400, italic em for emphasis
        'display-xl': [
          'clamp(2.6rem, 8.4vw, 7rem)',
          { lineHeight: '1.04', letterSpacing: '-0.015em', fontWeight: '400' },
        ],
        display: [
          'clamp(1.9rem, 4vw, 3.2rem)',
          { lineHeight: '1.12', letterSpacing: '-0.01em', fontWeight: '400' },
        ],
        'display-row': [
          'clamp(1.7rem, 4.4vw, 3.4rem)',
          { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '400' },
        ],
        title: ['1.15rem', { lineHeight: '1.3', fontWeight: '500' }],
        // body — Archivo
        lede: ['1.02rem', { lineHeight: '1.65' }],
        // uppercase label scale — Archivo semibold/bold + tracking
        kicker: [
          '0.72rem',
          { lineHeight: '1.4', letterSpacing: '0.26em', fontWeight: '700' },
        ],
        label: [
          '0.8rem',
          { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '600' },
        ],
        button: [
          '0.82rem',
          { lineHeight: '1', letterSpacing: '0.12em', fontWeight: '600' },
        ],
        micro: [
          '0.7rem',
          { lineHeight: '1.5', letterSpacing: '0.16em', fontWeight: '600' },
        ],
      },
      letterSpacing: {
        'tight-display': '-0.02em',
        'tighter-display': '-0.03em',
        'wide-label': '0.08em',
        kicker: '0.26em',
        marquee: '0.24em',
        count: '0.18em',
      },
      borderRadius: {
        tag: '3px',
        tile: '6px',
        card: '8px',
        pill: '999px',
      },
      boxShadow: {
        lifted: '0 18px 40px rgb(38 34 28 / 0.22)',
      },
      backgroundImage: {
        'tile-amber':
          'linear-gradient(150deg, var(--tile-amber-from), var(--tile-amber-to))',
        'tile-slate':
          'linear-gradient(150deg, var(--tile-slate-from), var(--tile-slate-to))',
        'tile-sage':
          'linear-gradient(150deg, var(--tile-sage-from), var(--tile-sage-to))',
        'tile-clay':
          'linear-gradient(150deg, var(--tile-clay-from), var(--tile-clay-to))',
        'film-glow':
          'radial-gradient(80% 100% at 20% 0%, rgb(224 159 62 / 0.35), transparent 60%), radial-gradient(70% 90% at 85% 90%, rgb(91 109 168 / 0.4), transparent 60%)',
      },
      transitionTimingFunction: {
        soft: 'var(--ease-soft)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        reveal: 'var(--duration-reveal)',
      },
      lineHeight: {
        body: '1.65',
      },
      spacing: {
        // section rhythm from the mockup
        section: '7.5rem',
        gutter: '4vw',
      },
      maxWidth: {
        wrap: '1240px',
      },
    },
  },
  plugins: [],
};

export default config;
