/**
 * Pet profiles `/account/pets` — middleware auth gate (signed-out redirects).
 *
 * Signed-in flows are covered by Phase 15 unit/integration tests — Playwright
 * cannot intercept SSR Supabase calls the way it does browser-only mocks.
 */
import { test, expect } from '@playwright/test';

test.describe('pet profiles account page', () => {
  test('redirects signed-out users to login with redirect param', async ({
    page,
  }) => {
    await page.goto('/account/pets');
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Welcome back' }),
    ).toBeVisible();
  });
});
