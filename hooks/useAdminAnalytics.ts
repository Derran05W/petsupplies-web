'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  adminAnalyticsDiscounts,
  adminAnalyticsLowStock,
  adminAnalyticsOverview,
  adminAnalyticsRevenueTimeseries,
  adminAnalyticsSubscriptions,
  adminAnalyticsTopProducts,
} from '@/lib/api/admin/analytics';
import type { AnalyticsRevenueRange } from '@/types/admin-analytics';

const ADMIN_ANALYTICS_ROOT = ['admin', 'analytics'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useAdminAnalyticsOverviewQuery() {
  return useQuery({
    queryKey: [...ADMIN_ANALYTICS_ROOT, 'overview'],
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminAnalyticsOverview(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
  });
}

export function useAdminAnalyticsRevenueTimeseriesQuery(
  range: AnalyticsRevenueRange,
) {
  return useQuery({
    queryKey: [...ADMIN_ANALYTICS_ROOT, 'revenue-timeseries', range],
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminAnalyticsRevenueTimeseries(
        range,
        accessToken ? { accessToken } : {},
      );
    },
    staleTime: 60_000,
  });
}

export function useAdminAnalyticsTopProductsQuery(limit = 10) {
  return useQuery({
    queryKey: [...ADMIN_ANALYTICS_ROOT, 'top', limit],
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminAnalyticsTopProducts(
        accessToken ? { accessToken, limit } : { limit },
      );
    },
    staleTime: 60_000,
  });
}

export function useAdminAnalyticsLowStockQuery(limit = 20) {
  return useQuery({
    queryKey: [...ADMIN_ANALYTICS_ROOT, 'low-stock', limit],
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminAnalyticsLowStock(
        accessToken ? { accessToken, limit } : { limit },
      );
    },
    staleTime: 60_000,
  });
}

export function useAdminAnalyticsSubscriptionsQuery() {
  return useQuery({
    queryKey: [...ADMIN_ANALYTICS_ROOT, 'subscriptions'],
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminAnalyticsSubscriptions(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
  });
}

export function useAdminAnalyticsDiscountsQuery() {
  return useQuery({
    queryKey: [...ADMIN_ANALYTICS_ROOT, 'discounts'],
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminAnalyticsDiscounts(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
  });
}
