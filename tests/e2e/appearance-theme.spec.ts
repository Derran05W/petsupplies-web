/**
 * Theme bootstrap from localStorage — no auth required.
 */
import { test, expect } from '@playwright/test';

const THEME_KEY = 'app-theme';

test.describe('appearance theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((key) => localStorage.removeItem(key), THEME_KEY);
  });

  test('dark from localStorage sets html data-theme', async ({ page }) => {
    await page.evaluate(
      (key) =>
        localStorage.setItem(key, JSON.stringify({ appearance: 'dark' })),
      THEME_KEY,
    );
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const bg = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    );
    expect(bg).not.toMatch(/^rgba\(0,\s*0,\s*0,\s*0\)$/);
  });

  test('tropical from localStorage sets html data-theme', async ({ page }) => {
    await page.evaluate(
      (key) =>
        localStorage.setItem(key, JSON.stringify({ appearance: 'tropical' })),
      THEME_KEY,
    );
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      'tropical',
    );
  });

  test('light default when storage empty', async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
