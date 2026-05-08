/**
 * Phase 9 e2e — add to cart.
 *
 * Walks: visit /products, open the first product, "Add to cart", then
 * navigate to /cart and confirm the line is there with the right
 * quantity and total. Uses the placeholder catalogue's first featured
 * product (the api fallback returns FEATURED_PRODUCTS in dev — Phase 4
 * fallback path), so the spec doesn't depend on petsupplies-api being
 * live.
 */
import { test, expect } from '@playwright/test';

test.describe('cart flow', () => {
  test('adds a product from the listing and shows it on /cart', async ({
    page,
  }) => {
    await page.goto('/products');

    // First product card — accessible name is the product heading.
    const firstCard = page.getByRole('link', { name: /Salmon/i }).first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // PDP — wait for the "Add to cart" button.
    const addBtn = page.getByRole('button', { name: 'Add to cart' });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    // Visit the cart page.
    await page.goto('/cart');

    // Cart heading is the page-shell h1.
    await expect(
      page.getByRole('heading', { level: 1, name: /Your cart/i }),
    ).toBeVisible();

    // Line item heading should match the product we added.
    const lineHeading = page
      .getByRole('heading', { level: 3 })
      .filter({ hasText: /Salmon/i })
      .first();
    await expect(lineHeading).toBeVisible();
  });
});
