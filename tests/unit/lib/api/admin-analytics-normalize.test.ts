import { describe, expect, it } from 'vitest';
import {
  normalizeAdminAnalyticsDiscounts,
  normalizeAdminAnalyticsLowStock,
  normalizeAdminAnalyticsOverview,
  normalizeAdminAnalyticsSubscriptions,
  normalizeAdminAnalyticsTopProducts,
} from '@/lib/api/admin/analytics-normalize';

describe('normalizeAdminAnalyticsTopProducts', () => {
  it('maps API { data } envelope to { items }', () => {
    const result = normalizeAdminAnalyticsTopProducts({
      data: [
        {
          productId: 'p1',
          slug: 'toy',
          name: 'Toy',
          unitsSold: 3,
          revenueCents: 900,
        },
      ],
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.productId).toBe('p1');
    expect(result.items[0]?.unitsSold).toBe(3);
  });

  it('returns empty items for missing envelope', () => {
    expect(normalizeAdminAnalyticsTopProducts({}).items).toEqual([]);
  });
});

describe('normalizeAdminAnalyticsOverview', () => {
  it('maps orderCount and defaults currency', () => {
    const result = normalizeAdminAnalyticsOverview({
      orderCount: 5,
      revenueCents: 1000,
      aovCents: 200,
    });
    expect(result.ordersCount).toBe(5);
    expect(result.currency).toBe('usd');
  });
});

describe('normalizeAdminAnalyticsSubscriptions', () => {
  it('maps byStatus to counts', () => {
    const result = normalizeAdminAnalyticsSubscriptions({
      byStatus: { ACTIVE: 2, PAUSED: 1, CANCELLED: 0 },
    });
    expect(result.activeCount).toBe(2);
    expect(result.pausedCount).toBe(1);
  });
});

describe('normalizeAdminAnalyticsLowStock', () => {
  it('maps stock to stockCount', () => {
    const result = normalizeAdminAnalyticsLowStock({
      data: [{ id: 'p1', name: 'A', slug: 'a', stock: 2 }],
    });
    expect(result.items[0]?.stockCount).toBe(2);
  });
});

describe('normalizeAdminAnalyticsDiscounts', () => {
  it('maps redemptionsInRange to uses', () => {
    const result = normalizeAdminAnalyticsDiscounts({
      data: [
        {
          code: 'SAVE10',
          redemptionsInRange: 4,
          revenueImpactCents: 500,
        },
      ],
    });
    expect(result.items[0]?.uses).toBe(4);
    expect(result.items[0]?.discountCents).toBe(500);
  });
});
