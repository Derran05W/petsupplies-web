import { defineConfig, devices } from '@playwright/test';

const baseURLTrimmed = (process.env.BASE_URL ?? '').trim();
const useRemote = baseURLTrimmed !== '';
const baseURL = useRemote ? baseURLTrimmed : 'http://localhost:3000';

/** In CI, `next dev` can flake (font manifest / watcher races). Production server after build is stabler. */
const isCi = process.env.CI === 'true';
const localWebServerCommand = isCi
  ? 'pnpm exec next build && pnpm exec next start -p 3000'
  : 'pnpm dev';
const localWebServerTimeout = isCi ? 300_000 : 120_000;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: useRemote
    ? undefined
    : {
        command: localWebServerCommand,
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: localWebServerTimeout,
        // Placeholder Supabase env values — keeps SSR clients constructible without
        // `.env.local` on every dev machine. Browser-side Supabase calls can still be
        // mocked with `page.route()`; middleware/server `getUser()` is not intercepted.
        env: {
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://test.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key',
          NEXT_PUBLIC_API_URL:
            process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
          /** SSR reviews fixture — Playwright cannot intercept Next server fetch. */
          E2E_REVIEWS_FIXTURE: '1',
          /** Force one staging slug OOS on SSR for back-in-stock notify UI. */
          E2E_STOCK_ALERT_FIXTURE: '1',
          E2E_PRODUCT_SLUG: 'cat-cocktail',
          E2E_OOS_PRODUCT_SLUG: 'dog-shoes',
          // Avoids EMFILE from file watchers on low-ulimit runners (e.g. some CI sandboxes).
          ...(process.env.CI ? { WATCHPACK_POLLING: '1' } : {}),
        },
      },
});
