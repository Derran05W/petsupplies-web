/**
 * Global settings drawer entry — signed-out users do not see the gear trigger.
 */
import { test, expect } from '@playwright/test';

test.describe('settings drawer', () => {
  test('signed-out homepage does not show Open settings control', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('button', { name: /open settings/i }),
    ).toHaveCount(0);
  });
});
