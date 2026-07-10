/**
 * Back-in-stock — auth redirect parity with wishlist / subscriptions flows.
 */
import { test, expect } from '@playwright/test';

test.describe('stock alerts', () => {
  test('signed-out PDP notify sends shoppers to login with redirect', async ({
    page,
  }) => {
    await page.goto('/products/chicken-crunch-cat-treats');

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
