/**
 * PDP reviews — guests can read reviews; submit form is disabled until sign-in.
 * E2E_REVIEWS_FIXTURE=1 supplies deterministic SSR review payloads.
 */
import { test, expect } from '@playwright/test';

test.describe('product detail page', () => {
  test('shows reviews to guests with sign-in required to submit', async ({
    page,
  }) => {
    await page.goto('/products/salmon-sweet-potato-recipe');

    await expect(
      page.getByRole('heading', { level: 2, name: 'Customer reviews' }),
    ).toBeVisible();

    await expect(page.getByText('Taylor')).toBeVisible();
    await expect(page.getByText(/Verified purchase/)).toBeVisible();

    await expect(page.getByText(/Sign in to submit a review/)).toBeVisible();

    const submit = page.getByRole('button', { name: 'Submit review' });
    await expect(submit).toBeDisabled();
  });
});
