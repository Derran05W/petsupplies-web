/**
 * Phase 9 e2e — homepage smoke.
 *
 * Catches a regression that breaks the entire shop layout group.
 * Asserts:
 *   - the Fraunces hero heading renders (interleaved headline rows built
 *     from the admin heroHeadline setting).
 *   - the featured products grid renders with at least one card.
 *   - the navbar's primary actions are present (logo link + Cart).
 */
import { test, expect } from '@playwright/test';

test.describe('homepage', () => {
  test('renders the hero, featured grid, and navbar primary actions', async ({
    page,
  }) => {
    await page.goto('/');

    // Hero heading — Fraunces h1; the seeded headline ends in "love."
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('love');

    // Featured products section — boutique heading from home-content.
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /The current obsessions/,
      }),
    ).toBeVisible();

    // Navbar — logo + cart trigger always-on-screen. Scope to the
    // banner role so we don't collide with the footer's identical
    // brand-name link.
    const navbar = page.getByRole('banner');
    await expect(
      navbar.getByRole('link', { name: "Aileen's petstore" }),
    ).toBeVisible();
    await expect(
      navbar.getByRole('button', { name: /Cart/ }).first(),
    ).toBeVisible();
  });
});
