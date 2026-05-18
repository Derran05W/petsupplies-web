import type {
  AdminAnalyticsDiscounts,
  AdminAnalyticsLowStock,
  AdminAnalyticsOverview,
  AdminAnalyticsRevenueTimeseries,
  AdminAnalyticsSubscriptions,
  AdminAnalyticsTopProducts,
  AnalyticsRevenueRange,
} from '@/types/admin-analytics';
import { apiFetch } from '../client';

export interface AdminApiOptions {
  accessToken?: string;
}

export async function adminAnalyticsOverview(
  options: AdminApiOptions = {},
): Promise<AdminAnalyticsOverview> {
  const { accessToken } = options;
  return apiFetch<AdminAnalyticsOverview>('/admin/analytics/overview', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}

export async function adminAnalyticsRevenueTimeseries(
  range: AnalyticsRevenueRange,
  options: AdminApiOptions = {},
): Promise<AdminAnalyticsRevenueTimeseries> {
  const { accessToken } = options;
  const q = new URLSearchParams({ range });
  return apiFetch<AdminAnalyticsRevenueTimeseries>(
    `/admin/analytics/revenue-timeseries?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
}

export async function adminAnalyticsTopProducts(
  options: AdminApiOptions & { limit?: number } = {},
): Promise<AdminAnalyticsTopProducts> {
  const { accessToken, limit = 10 } = options;
  const q = new URLSearchParams({ limit: String(limit) });
  return apiFetch<AdminAnalyticsTopProducts>(
    `/admin/analytics/products/top?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
}

export async function adminAnalyticsLowStock(
  options: AdminApiOptions & { limit?: number } = {},
): Promise<AdminAnalyticsLowStock> {
  const { accessToken, limit = 20 } = options;
  const q = new URLSearchParams({ limit: String(limit) });
  return apiFetch<AdminAnalyticsLowStock>(
    `/admin/analytics/products/low-stock?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
}

export async function adminAnalyticsSubscriptions(
  options: AdminApiOptions = {},
): Promise<AdminAnalyticsSubscriptions> {
  const { accessToken } = options;
  return apiFetch<AdminAnalyticsSubscriptions>(
    '/admin/analytics/subscriptions',
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
}

export async function adminAnalyticsDiscounts(
  options: AdminApiOptions = {},
): Promise<AdminAnalyticsDiscounts> {
  const { accessToken } = options;
  return apiFetch<AdminAnalyticsDiscounts>('/admin/analytics/discounts', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
