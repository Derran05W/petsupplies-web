/**
 * Phase 9 e2e — admin role gate (signed-out path).
 *
 * With no Supabase session cookies, `/admin` redirects to login with
 * `?redirect=/admin`.
 *
 * Signed-in scenarios (non-admin → `/`, admin → dashboard) are **not**
 * exercised here: middleware runs server-side `supabase.auth.getUser()`,
 * and Playwright `page.route()` only intercepts the **browser** stack,
 * not the Next.js server’s outbound Auth fakes. Covering those paths
 * would need storageState + real cookie shape, a test double upstream,
 * or an integration test against a running API.
 */
import { test, expect } from '@playwright/test';

test.describe('admin role gate', () => {
  test('redirects signed-out users to /login?redirect=/admin', async ({
    page,
  }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin$/);
  });
});
