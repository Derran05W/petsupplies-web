/**
 * Phase 9 e2e — admin role gate.
 *
 * Walks the three middleware redirect outcomes:
 *   1. signed-out user → /admin redirects to /login?redirect=/admin
 *   2. signed-in non-admin → /admin redirects to /
 *   3. signed-in admin → /admin renders the dashboard heading
 *
 * Mock strategy: middleware calls `supabase.auth.getUser()`, which the
 * `@supabase/ssr` server client implements as a POST to
 * `<SUPABASE_URL>/auth/v1/user`. We intercept that endpoint via
 * `page.route()` and return either a 401 (signed out) or a 200 with the
 * desired user metadata. This is more robust than reverse-engineering
 * the chunked Supabase auth cookie shape (which changes between
 * @supabase/ssr versions) — the middleware doesn't care how the cookie
 * is parsed as long as the eventual `getUser()` call returns the right
 * shape.
 *
 * The signed-out path uses no route mock (no cookies set + no user
 * endpoint reached → middleware treats the request as unauthenticated).
 *
 * NOT covered: the cookie-parsing layer itself. That's @supabase/ssr's
 * responsibility and is tested upstream.
 */
import { test, expect, type Route } from '@playwright/test';

const SUPABASE_USER_PATH = '/auth/v1/user';

interface UserMock {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

async function setUserResponse(route: Route, user: UserMock | null) {
  if (user === null) {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'No user' }),
    });
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: user.id,
      aud: 'authenticated',
      email: user.email,
      user_metadata: user.user_metadata ?? {},
      app_metadata: { provider: 'email' },
    }),
  });
}

test.describe('admin role gate', () => {
  test('redirects signed-out users to /login?redirect=/admin', async ({
    page,
  }) => {
    // No route mock — middleware sees no cookies and skips the
    // getUser() round trip entirely (it returns user: null directly).
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin$/);
  });

  test('signed-in admin can open dashboard, customers, fulfillment, analytics', async ({
    page,
  }) => {
    const userUrl = `https://test.supabase.co${SUPABASE_USER_PATH}`;
    await page.route(userUrl, async (route) =>
      setUserResponse(route, {
        id: 'admin-1',
        email: 'admin@example.com',
        user_metadata: { role: 'ADMIN', name: 'Admin User' },
      }),
    );

    await page.goto('/admin');
    await expect(
      page.getByRole('heading', { name: 'Dashboard' }),
    ).toBeVisible();

    await page.goto('/admin/customers');
    await expect(
      page.getByRole('heading', { name: 'Customers' }),
    ).toBeVisible();

    await page.goto('/admin/fulfillment');
    await expect(
      page.getByRole('heading', { name: 'Fulfillment' }),
    ).toBeVisible();

    await page.goto('/admin/analytics');
    await expect(
      page.getByRole('heading', { name: 'Analytics' }),
    ).toBeVisible();
  });

  test('signed-in non-admin is redirected away from admin customers', async ({
    page,
  }) => {
    const userUrl = `https://test.supabase.co${SUPABASE_USER_PATH}`;
    await page.route(userUrl, async (route) =>
      setUserResponse(route, {
        id: 'user-1',
        email: 'cust@example.com',
        user_metadata: { role: 'CUSTOMER' },
      }),
    );

    await page.goto('/admin/customers');
    await expect(page).toHaveURL('/');
  });
});
