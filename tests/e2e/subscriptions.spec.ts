/**
 * Subscribe & Save — middleware auth gate (signed-out redirects to login).
 *
 * Mirrors `pets.spec.ts` / `wishlist.spec.ts`: Playwright mocks Supabase
 * without a real session cookie, so unauthenticated shoppers never reach `/account/subscriptions`.
 */
import { test, expect } from '@playwright/test';

test.describe('subscribe and save account page', () => {
  test('redirects signed-out users to login with redirect param', async ({
    page,
  }) => {
    await page.goto('/account/subscriptions');
    await expect(page).toHaveURL(/\/login\?redirect=.*account%2Fsubscriptions/);
  });
});
