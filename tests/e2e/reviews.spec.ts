/**
 * PDP reviews smoke — relies on `E2E_REVIEWS_FIXTURE=1` in Playwright’s
 * webServer env so SSR receives deterministic review payloads (browser
 * routing cannot intercept Next.js server-side fetch).
 */
import { test, expect } from '@playwright/test';

test.describe('product reviews', () => {
  test('renders customer reviews with a verified purchase badge', async ({
    page,
  }) => {
    await page.goto('/products/salmon-sweet-potato-recipe');

    await expect(
      page.getByRole('heading', { level: 2, name: 'Customer reviews' }),
    ).toBeVisible();

    await expect(page.getByText('Taylor Verified')).toBeVisible();
    await expect(page.getByText(/Verified purchase/)).toBeVisible();
    await expect(page.getByText(/Bowls cleared nightly/)).toBeVisible();
  });
});
