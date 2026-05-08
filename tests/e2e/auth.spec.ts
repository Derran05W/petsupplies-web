/**
 * Phase 9 e2e — auth (sign-in form smoke).
 *
 * Mock boundary: intercept the Supabase auth password endpoint via
 * `page.route()` and return a 400 so the form surfaces an inline error
 * via `setError('root', ...)`. This validates the visible error path
 * without depending on a real Supabase project.
 *
 * NOT covered: the redirect-on-success path. That path requires a
 * real cookie / session round-trip which the form drives via
 * `router.replace(...)`. We unit-test the form's redirect target
 * derivation via the `?redirect=` searchParam test inside
 * `tests/e2e/admin-gate.spec.ts` (which exercises the redirect contract
 * end-to-end against the middleware).
 */
import { test, expect } from '@playwright/test';

test.describe('login form', () => {
  test('renders the form fields and the create-account link', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Welcome back' }),
    ).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Create an account' }),
    ).toBeVisible();
  });

  test('surfaces a server error when Supabase rejects the credentials', async ({
    page,
  }) => {
    // Intercept the Supabase password sign-in. The browser client posts
    // to /auth/v1/token?grant_type=password — match by URL substring so
    // the Supabase project ref doesn't have to be hard-coded.
    await page.route(
      (url) => url.pathname.includes('/auth/v1/token'),
      async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Invalid login credentials',
          }),
        });
      },
    );

    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('badpass-123');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByText(/Invalid login credentials/i)).toBeVisible();
  });
});
