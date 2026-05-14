/**
 * Wishlist — signed-out heart sends shoppers to login with redirect.
 */
import { test, expect } from '@playwright/test';

test.describe('wishlist', () => {
  test('save button on listing redirects unsigned shoppers to login', async ({
    page,
  }) => {
    await page.goto('/products');

    const heart = page
      .getByRole('button', { name: /save to wishlist/i })
      .first();
    await expect(heart).toBeVisible();
    await heart.click();

    await expect(page).toHaveURL(/\/login\?redirect=/);
  });
});
