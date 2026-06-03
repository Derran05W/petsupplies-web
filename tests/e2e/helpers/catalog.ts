import { expect, type Page } from '@playwright/test';

/** Default PDP slug on staging — override with E2E_PRODUCT_SLUG in CI if needed. */
export const E2E_PRODUCT_SLUG =
  process.env.E2E_PRODUCT_SLUG?.trim() || 'cat-cocktail';

/** Slug forced out-of-stock when E2E_STOCK_ALERT_FIXTURE=1 (see getProductBySlug). */
export const E2E_OOS_PRODUCT_SLUG =
  process.env.E2E_OOS_PRODUCT_SLUG?.trim() || 'dog-shoes';

/** Product cards link to `/products/:slug` and include an h3 title. */
export async function waitForProductGrid(page: Page): Promise<void> {
  const productLink = page
    .locator('a[href^="/products/"]')
    .filter({ has: page.getByRole('heading', { level: 3 }) })
    .first();
  await expect(productLink).toBeVisible({ timeout: 15_000 });
}

export async function firstProductCardLink(page: Page) {
  await waitForProductGrid(page);
  return page
    .locator('a[href^="/products/"]')
    .filter({ has: page.getByRole('heading', { level: 3 }) })
    .first();
}
