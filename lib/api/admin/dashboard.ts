import type { DashboardStats } from '@/types/admin';
import { ApiError } from '../client';
import { loadAdminProducts } from '@/lib/admin/storage';
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/config';
import { PLACEHOLDER_ORDERS } from '@/lib/placeholder/orders';
import { adminAnalyticsLowStock, adminAnalyticsOverview } from './analytics';

export interface AdminApiOptions {
  accessToken?: string;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

let warnedAboutDashboardFallback = false;

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
  try {
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
  } catch (err) {
    if (err instanceof ApiError && err.isNetworkError) {
      if (!warnedAboutDashboardFallback) {
        warnedAboutDashboardFallback = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[admin/dashboard] backend unreachable — synthesising stats from placeholder data',
        );
      }
      return synthesise();
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Local fallback                                                             */
/* TODO(phase 8): remove once backend phase 8 admin endpoints are on staging. */
/* -------------------------------------------------------------------------- */

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function synthesise(): DashboardStats {
  const products = loadAdminProducts();
  const now = Date.now();

  let ordersThisWeek = 0;
  let revenueCentsThisWeek = 0;
  let ordersLastWeek = 0;
  let revenueCentsLastWeek = 0;
  let currency = 'cad';

  for (const order of PLACEHOLDER_ORDERS) {
    const placedAt = new Date(order.createdAt).getTime();
    if (Number.isNaN(placedAt)) continue;
    const ageMs = now - placedAt;
    if (ageMs < 0) continue;
    if (ageMs <= ONE_WEEK_MS) {
      ordersThisWeek += 1;
      revenueCentsThisWeek += order.totalCents;
      currency = order.currency;
    } else if (ageMs <= ONE_WEEK_MS * 2) {
      ordersLastWeek += 1;
      revenueCentsLastWeek += order.totalCents;
    }
  }

  // Seeded data is from 2026-04 / 2026-05 — when the dev clock is much
  // later, the buckets above will both be zero. Surface a believable
  // tile by counting all seeded orders as "this week" so the dashboard
  // never reads "0 orders / $0" in a fresh dev environment.
  if (ordersThisWeek === 0 && PLACEHOLDER_ORDERS.length > 0) {
    ordersThisWeek = PLACEHOLDER_ORDERS.length;
    revenueCentsThisWeek = PLACEHOLDER_ORDERS.reduce(
      (sum, order) => sum + order.totalCents,
      0,
    );
    currency = PLACEHOLDER_ORDERS[0]?.currency ?? 'cad';
  }

  const lowStock = products
    .filter((p) => p.stockCount <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stockCount - b.stockCount)
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      stockCount: product.stockCount,
      primaryImageUrl:
        product.images.find((image) => image.isPrimary)?.url ??
        product.images[0]?.url ??
        FALLBACK_IMAGE,
    }));

  return {
    ordersThisWeek,
    ordersLastWeek,
    revenueCentsThisWeek,
    revenueCentsLastWeek,
    lowStockCount: products.filter((p) => p.stockCount <= LOW_STOCK_THRESHOLD)
      .length,
    currency,
    lowStockProducts: lowStock,
  };
}
