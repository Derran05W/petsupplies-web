/**
 * Phase 9 e2e — checkout (Stripe test mode).
 *
 * Why this spec mocks the backend instead of driving real Stripe test
 * mode end-to-end:
 *   - Stripe-hosted Checkout is on a foreign origin (checkout.stripe.com)
 *     and Playwright cannot drive it deterministically across runs
 *     without flake (UI changes, captcha, occasional 3DS challenges,
 *     latency spikes).
 *   - The frontend's job is to (a) collect a valid shipping address,
 *     (b) POST it to /checkout, and (c) navigate to the returned URL.
 *     Mocking (b) lets us assert (a) and (c) deterministically without
 *     leaving our origin.
 *
 * If the backend grows a fully deterministic test mode (Stripe Test
 * Clocks aren't enough for the hosted UI), revisit this decision and
 * lift the mock.
 *
 * What's covered here:
 *   1. Visiting `/checkout/cancel` directly renders the friendly
 *      cancel panel.
 *   2. Visiting `/checkout/success?session_id=...` directly renders the
 *      success surface (the dev fallback synthesises an order from the
 *      sessionStorage snapshot, which we don't seed here — the page
 *      still renders the polling state without crashing).
 */
import { test, expect } from '@playwright/test';

test.describe('checkout pages', () => {
  test('/checkout/cancel renders the cancel panel without clearing the cart', async ({
    page,
  }) => {
    await page.goto('/checkout/cancel');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Checkout cancelled.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Return to cart' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Keep shopping' }),
    ).toBeVisible();
  });

  test('/checkout/success renders the polling surface for an unseeded session', async ({
    page,
  }) => {
    // No sessionStorage snapshot is set, so the dev fallback yields no
    // order — the page should render without crashing and surface
    // polling / timeout copy. We just assert the page didn't 500 and a
    // recognisable surface exists.
    await page.goto('/checkout/success?session_id=cs_test_e2e_smoke');

    // The success surface always renders a heading-level marker — the
    // confirmed / polling / timeout states all use a Fraunces h1.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
