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
        // ── saharaDawn palette ───────────────────────────────────────────
        // Source colours (lib/config/brand.ts → theme):
        //   coral      #F16C43  →  brand-400
        //   peach      #FFA47C  →  brand-300
        //   terracotta #A4645A  →  brand-600
        //   dustyRose  #A37777  →  warm-400
        //   deepPlum   #612F3A  →  warm-900
        // ────────────────────────────────────────────────────────────────
        brand: {
          50: '#FEF3EF',
          100: '#FCDDD3',
          200: '#F9BBA8',
          300: '#FFA47C', // peach
          400: '#F16C43', // coral  — primary action
          500: '#D4522A',
          600: '#A4645A', // terracotta — links / brand text
          700: '#7A3D35',
        },
        warm: {
          50: '#FBF8F8',
          100: '#F4ECED',
          200: '#E5D5D7',
          300: '#CABABB',
          400: '#A37777', // dustyRose — placeholder / muted text
          600: '#7A5458',
          900: '#612F3A', // deepPlum  — primary text
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
