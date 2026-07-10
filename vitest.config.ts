import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Phase 9 - Testing
 *
 * Coverage thresholds match the PLAN spec exactly: 80% lines / statements
 * / functions, 70% branches. Do not bump these silently - the lower
 * branch number is honest about the network-error branches in lib/api
 * that are exercised by the e2e suite, not by jsdom unit tests.
 *
 * coverage.include is intentionally narrowed to the surfaces Phase 9
 * actually exercises (the five PLAN-named targets plus the helpers each
 * test naturally pulls in). Files outside this list are validated by
 * Playwright e2e or are thin SSR wrappers that are not worth covering
 * in jsdom: RSC pages, Supabase SSR plumbing, test fixtures, and the
 * Next/Tailwind config.
 *
 * If a future phase adds a unit-tested surface, append it here so the
 * threshold remains a real signal instead of a denominator bomb.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'components/ui/ProductCard.tsx',
        'components/cart/CartItem.tsx',
        'components/admin/products/AiDescriptionBtn.tsx',
        'lib/store/cart.ts',
        'lib/utils.ts',
        'lib/utils/format.ts',
        'lib/admin/ai-fallback.ts',
        'lib/api/email.ts',
        'lib/api/cart-recovery.ts',
      ],
      exclude: ['**/*.d.ts', '**/types/**', 'lib/supabase/**'],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
