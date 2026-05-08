import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

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
  webServer: process.env.BASE_URL
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
        },
      },
});
