/**
 * Phase 9 e2e — add to cart.
 *
 * Walks: visit /products, open the first in-stock product, "Add to cart",
 * then navigate to /cart and confirm the line is there. Uses whatever the
 * live catalogue returns (staging API in CI).
 */
import { test, expect } from '@playwright/test';
import { firstProductCardLink, waitForProductGrid } from './helpers/catalog';

test.describe('cart flow', () => {
  test('adds a product from the listing and shows it on /cart', async ({
    page,
  }) => {
    await page.goto('/products');
    await waitForProductGrid(page);

    const firstCard = await firstProductCardLink(page);
    const productName = (
      await firstCard.getByRole('heading', { level: 3 }).textContent()
    )?.trim();
    expect(productName).toBeTruthy();
    await firstCard.click();

    const addBtn = page.getByRole('button', { name: 'Add to cart' });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    await page.goto('/cart');

    await expect(
      page.getByRole('heading', { level: 1, name: /Your cart/i }),
    ).toBeVisible();

    await expect(
      page
        .getByRole('heading', { level: 3 })
        .filter({ hasText: productName! })
        .first(),
    ).toBeVisible();
  });
});
