import { defineConfig, devices } from '@playwright/test';

const baseURLTrimmed = (process.env.BASE_URL ?? '').trim();
const useRemote = baseURLTrimmed !== '';
const baseURL = useRemote ? baseURLTrimmed : 'http://localhost:3000';

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
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // Placeholder Supabase env values — the e2e suite mocks every
        // outbound Supabase request via page.route(), so the anon key
        // only needs to be a non-empty string for the SSR client to
        // construct. This avoids polluting `.env.local` (gitignored)
        // with secret-shaped strings on every dev machine.
        env: {
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://test.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key',
          NEXT_PUBLIC_API_URL:
            process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
          /** SSR reviews fixture — Playwright cannot intercept Next server fetch. */
          E2E_REVIEWS_FIXTURE: '1',
          // Avoids EMFILE from file watchers on low-ulimit runners (e.g. some CI sandboxes).
          ...(process.env.CI ? { WATCHPACK_POLLING: '1' } : {}),
        },
      },
});
