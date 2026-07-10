/**
 * Lightweight smoke covering `/email/*` surfaces that intentionally render
 * without signed tokens — they should degrade to friendly onboarding copy rather
 * than crash the App Router boundary.
 */
import { expect, test } from '@playwright/test';

test.describe('phase 11 email UX', () => {
  test('/email/unsubscribe without a token warns that the link is invalid', async ({
    page,
  }) => {
    await page.goto('/email/unsubscribe');

    await expect(
      page.getByRole('heading', { name: /unsubscribe link is invalid/i }),
    ).toBeVisible();
    await expect(page.getByText(/link expired/i)).toBeVisible();
  });

  test('/email/order without parameters warns that the link is invalid', async ({
    page,
  }) => {
    await page.goto('/email/order');

    await expect(
      page.getByRole('heading', { name: /order link is invalid/i }),
    ).toBeVisible();
    await expect(page.getByText(/link expired/i)).toBeVisible();
  });
});
