/**
 * Admin analytics — Phase 21 backend routes under `/admin/analytics/*`.
 * Field names follow camelCase JSON; reconcile with live API if snake_case appears.
 */

export type AnalyticsRevenueRange = '7d' | '30d' | '90d';

/** GET /admin/analytics/overview */
export interface AdminAnalyticsOverview {
  revenueCents: number;
  ordersCount: number;
  customersCount: number;
  aovCents: number;
  currency: string;
  periodDays: number;
}

export interface AdminAnalyticsRevenuePoint {
  date: string;
  revenueCents: number;
  orderCount: number;
}

/** GET /admin/analytics/revenue-timeseries */
export interface AdminAnalyticsRevenueTimeseries {
  currency: string;
  points: AdminAnalyticsRevenuePoint[];
}

export interface AdminAnalyticsTopProductRow {
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string;
  unitsSold: number;
  revenueCents: number;
}

/** GET /admin/analytics/products/top */
export interface AdminAnalyticsTopProducts {
  items: AdminAnalyticsTopProductRow[];
}

export interface AdminAnalyticsLowStockRow {
  id: string;
  name: string;
  slug: string;
  stockCount: number;
  primaryImageUrl: string;
}

/** GET /admin/analytics/products/low-stock */
export interface AdminAnalyticsLowStock {
  items: AdminAnalyticsLowStockRow[];
}

/** GET /admin/analytics/subscriptions */
export interface AdminAnalyticsSubscriptions {
  activeCount: number;
  pausedCount: number;
  cancelledCount: number;
  mrrCents: number;
  churnPercent?: number;
}

export interface AdminAnalyticsDiscountRow {
  code: string;
  uses: number;
  revenueCents: number;
  discountCents: number;
}

/** GET /admin/analytics/discounts */
export interface AdminAnalyticsDiscounts {
  items: AdminAnalyticsDiscountRow[];
}
