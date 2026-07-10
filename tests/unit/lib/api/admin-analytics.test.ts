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

  it('GET overview maps the wire OverviewResult (orderCount, no currency)', async () => {
    // Real wire shape from adminDashboardService.getOverview.
    const body = {
      range: {
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-01-31T00:00:00.000Z',
      },
      orderCount: 2,
      paidOrderCount: 2,
      revenueCents: 1000,
      aovCents: 500,
      byStatus: { PENDING: 0, PAID: 2, SHIPPED: 0, FULFILLED: 0, CANCELLED: 0 },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        expect(String(url)).toContain('/admin/analytics/overview');
        return Response.json(body, { status: 200 });
      }),
    );

    const result = await adminAnalyticsOverview({ accessToken: 'tok' });
    expect(result.ordersCount).toBe(2);
    expect(result.revenueCents).toBe(1000);
    expect(result.currency).toBe('cad');
    expect(result.customersCount).toBe(0);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.stringContaining('/admin/analytics/overview'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET revenue-timeseries sends from/to and maps bucket → date', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        // Real wire shape: { granularity, points: [{ bucket, ... }] }, no currency.
        Response.json(
          {
            granularity: 'day',
            points: [
              {
                bucket: '2026-01-01T00:00:00.000Z',
                revenueCents: 500,
                orderCount: 1,
              },
            ],
          },
          { status: 200 },
        ),
      ),
    );

    const res = await adminAnalyticsRevenueTimeseries('7d');
    const call = vi.mocked(fetch).mock.calls[0]?.[0];
    expect(String(call)).toContain('from=');
    expect(String(call)).toContain('to=');
    expect(res.currency).toBe('cad');
    expect(res.points[0]?.date).toBe('2026-01-01T00:00:00.000Z');
    expect(res.points[0]?.revenueCents).toBe(500);
  });

  it('GET top products propagates ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'nope' }, { status: 401 })),
    );

    await expect(adminAnalyticsTopProducts()).rejects.toBeInstanceOf(ApiError);
  });
});
