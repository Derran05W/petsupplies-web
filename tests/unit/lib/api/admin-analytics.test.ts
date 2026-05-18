import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  adminAnalyticsOverview,
  adminAnalyticsRevenueTimeseries,
  adminAnalyticsTopProducts,
} from '@/lib/api/admin/analytics';

describe('lib/api/admin/analytics', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET overview sends Authorization and parses JSON', async () => {
    const body = {
      revenueCents: 1000,
      ordersCount: 2,
      customersCount: 3,
      aovCents: 500,
      currency: 'usd',
      periodDays: 30,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        expect(String(url)).toContain('/admin/analytics/overview');
        return Response.json(body, { status: 200 });
      }),
    );

    const result = await adminAnalyticsOverview({ accessToken: 'tok' });
    expect(result).toEqual(body);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/admin/analytics/overview',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET revenue-timeseries includes range query param', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            currency: 'usd',
            points: [{ date: '2026-01-01', revenueCents: 0, orderCount: 0 }],
          },
          { status: 200 },
        ),
      ),
    );

    await adminAnalyticsRevenueTimeseries('7d');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('range=7d'),
      expect.anything(),
    );
  });

  it('GET top products propagates ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'nope' }, { status: 401 })),
    );

    await expect(adminAnalyticsTopProducts()).rejects.toBeInstanceOf(ApiError);
  });
});
