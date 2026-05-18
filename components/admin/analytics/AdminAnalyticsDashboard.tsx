import { ApiError } from '@/lib/api/client';
import {
  adminAnalyticsDiscounts,
  adminAnalyticsLowStock,
  adminAnalyticsOverview,
  adminAnalyticsSubscriptions,
  adminAnalyticsTopProducts,
} from '@/lib/api/admin/analytics';
import { AnalyticsOverviewCards } from './AnalyticsOverviewCards';
import { RevenueChartClient } from './RevenueChartClient';
import { TopProductsTable } from './TopProductsTable';
import { LowStockAnalyticsPanel } from './LowStockAnalyticsPanel';
import { SubscriptionStatsPanel } from './SubscriptionStatsPanel';
import { DiscountStatsPanel } from './DiscountStatsPanel';

interface AdminAnalyticsDashboardProps {
  accessToken?: string;
}

/**
 * Server component: parallel fetch Phase 21 analytics (except timeseries — client chart).
 */
export async function AdminAnalyticsDashboard({
  accessToken,
}: AdminAnalyticsDashboardProps) {
  const opts = accessToken ? { accessToken } : {};

  try {
    const [overview, top, low, subs, discounts] = await Promise.all([
      adminAnalyticsOverview(opts),
      adminAnalyticsTopProducts({ ...opts, limit: 10 }),
      adminAnalyticsLowStock({ ...opts, limit: 20 }),
      adminAnalyticsSubscriptions(opts),
      adminAnalyticsDiscounts(opts),
    ]);

    const currency = overview.currency;

    return (
      <>
        <AnalyticsOverviewCards overview={overview} />

        <div className="mt-8">
          <RevenueChartClient />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
          <TopProductsTable items={top.items} currency={currency} />
          <LowStockAnalyticsPanel items={low.items} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
          <SubscriptionStatsPanel stats={subs} currency={currency} />
          <DiscountStatsPanel items={discounts.items} currency={currency} />
        </div>
      </>
    );
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.message
        : 'Something went wrong loading analytics.';
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-body text-sm text-red-800"
      >
        {message}
      </div>
    );
  }
}
