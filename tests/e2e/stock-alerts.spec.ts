/**
 * Back-in-stock — auth redirect parity with wishlist / subscriptions flows.
 * E2E_STOCK_ALERT_FIXTURE forces E2E_OOS_PRODUCT_SLUG out-of-stock on SSR.
 */
import { test, expect } from '@playwright/test';
import { E2E_OOS_PRODUCT_SLUG } from './helpers/catalog';

test.describe('stock alerts', () => {
  test('signed-out PDP notify sends shoppers to login with redirect', async ({
    page,
  }) => {
    await page.goto(`/products/${E2E_OOS_PRODUCT_SLUG}`);

    const notify = page.getByRole('button', {
      name: /notify me when back/i,
    });
    await expect(notify).toBeVisible();
    await notify.click();

    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test('/account/notifications redirects when signed out', async ({ page }) => {
    await page.goto('/account/notifications');
    await expect(page).toHaveURL(/\/login\?redirect=.*notifications/);
  });
});
