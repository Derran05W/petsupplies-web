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
import {
  normalizeAdminAnalyticsDiscounts,
  normalizeAdminAnalyticsLowStock,
  normalizeAdminAnalyticsOverview,
  normalizeAdminAnalyticsSubscriptions,
  normalizeAdminAnalyticsTopProducts,
} from './analytics-normalize';

export interface AdminApiOptions {
  accessToken?: string;
}

export async function adminAnalyticsOverview(
  options: AdminApiOptions = {},
): Promise<AdminAnalyticsOverview> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>('/admin/analytics/overview', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
  return normalizeAdminAnalyticsOverview(raw);
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
  const raw = await apiFetch<unknown>(`/admin/analytics/products/top?${q}`, {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
  return normalizeAdminAnalyticsTopProducts(raw);
}

export async function adminAnalyticsLowStock(
  options: AdminApiOptions & { limit?: number } = {},
): Promise<AdminAnalyticsLowStock> {
  const { accessToken, limit = 20 } = options;
  const q = new URLSearchParams({ limit: String(limit) });
  const raw = await apiFetch<unknown>(
    `/admin/analytics/products/low-stock?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
  return normalizeAdminAnalyticsLowStock(raw);
}

export async function adminAnalyticsSubscriptions(
  options: AdminApiOptions = {},
): Promise<AdminAnalyticsSubscriptions> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>('/admin/analytics/subscriptions', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
  return normalizeAdminAnalyticsSubscriptions(raw);
}

export async function adminAnalyticsDiscounts(
  options: AdminApiOptions = {},
): Promise<AdminAnalyticsDiscounts> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>('/admin/analytics/discounts', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
  return normalizeAdminAnalyticsDiscounts(raw);
}
