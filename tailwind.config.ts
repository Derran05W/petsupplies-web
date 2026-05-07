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
          50: '#EDFAF2',
          100: '#C6F0D8',
          200: '#8CDDB0',
          300: '#4DC480',
          400: '#25A85E',
          500: '#1A8C4E',
          600: '#136B3B',
          700: '#0D4D2A',
        },
        warm: {
          50: '#FDFBF7',
          100: '#F7F3EC',
          200: '#EDE8DF',
          300: '#D9D2C5',
          400: '#B8AFA0',
          600: '#6B6059',
          900: '#1E1A16',
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
