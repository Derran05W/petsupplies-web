import type { DashboardStats } from '@/types/admin';
import { adminAnalyticsLowStock, adminAnalyticsOverview } from './analytics';

export interface AdminApiOptions {
  accessToken?: string;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

/**
 * There is no `GET /admin/dashboard` endpoint. We compose dashboard stats from
 * `GET /admin/analytics/overview` (KPIs) and `GET /admin/analytics/products/low-stock`.
 * The overview has no this-week / last-week split, so the "last week" tiles are
 * surfaced as 0 (no comparison data on the wire).
 * followup: backend could add period-over-period deltas to `/admin/analytics/overview`.
 */
export async function getDashboardStats(
  options: AdminApiOptions = {},
): Promise<DashboardStats> {
  const { accessToken } = options;
  const opts = accessToken ? { accessToken } : {};
  const [overview, lowStock] = await Promise.all([
    adminAnalyticsOverview(opts),
    adminAnalyticsLowStock({ ...opts, limit: 5 }),
  ]);
  return {
    ordersThisWeek: overview.ordersCount,
    ordersLastWeek: 0,
    revenueCentsThisWeek: overview.revenueCents,
    revenueCentsLastWeek: 0,
    lowStockCount: lowStock.items.length,
    currency: overview.currency,
    lowStockProducts: lowStock.items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      stockCount: p.stockCount,
      primaryImageUrl: p.primaryImageUrl || FALLBACK_IMAGE,
    })),
  };
}
