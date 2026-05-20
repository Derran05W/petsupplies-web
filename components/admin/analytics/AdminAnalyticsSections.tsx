import { ApiError } from '@/lib/api/client';
import {
  adminAnalyticsDiscounts,
  adminAnalyticsLowStock,
  adminAnalyticsSubscriptions,
  adminAnalyticsTopProducts,
} from '@/lib/api/admin/analytics';
import { getAdminApiOpts } from '@/lib/api/admin/server-opts';
import { loadAdminAnalyticsOverview } from '@/lib/api/admin/analytics-server';
import { AnalyticsOverviewCards } from './AnalyticsOverviewCards';
import { TopProductsTable } from './TopProductsTable';
import { LowStockAnalyticsPanel } from './LowStockAnalyticsPanel';
import { SubscriptionStatsPanel } from './SubscriptionStatsPanel';
import { DiscountStatsPanel } from './DiscountStatsPanel';

function sectionErrorMessage(err: unknown): string {
  return err instanceof ApiError
    ? err.message
    : 'Something went wrong loading this section.';
}

function AnalyticsSectionError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-body text-sm text-red-800"
    >
      {message}
    </div>
  );
}

export async function AnalyticsOverviewSection() {
  try {
    const overview = await loadAdminAnalyticsOverview();
    return <AnalyticsOverviewCards overview={overview} />;
  } catch (err) {
    return <AnalyticsSectionError message={sectionErrorMessage(err)} />;
  }
}

export async function AnalyticsTopProductsSection() {
  try {
    const [opts, overview] = await Promise.all([
      getAdminApiOpts(),
      loadAdminAnalyticsOverview(),
    ]);
    const top = await adminAnalyticsTopProducts({ ...opts, limit: 10 });
    return <TopProductsTable items={top.items} currency={overview.currency} />;
  } catch (err) {
    return <AnalyticsSectionError message={sectionErrorMessage(err)} />;
  }
}

export async function AnalyticsLowStockSection() {
  try {
    const opts = await getAdminApiOpts();
    const low = await adminAnalyticsLowStock({ ...opts, limit: 20 });
    return <LowStockAnalyticsPanel items={low.items} />;
  } catch (err) {
    return <AnalyticsSectionError message={sectionErrorMessage(err)} />;
  }
}

export async function AnalyticsSubscriptionsSection() {
  try {
    const [opts, overview] = await Promise.all([
      getAdminApiOpts(),
      loadAdminAnalyticsOverview(),
    ]);
    const subs = await adminAnalyticsSubscriptions(opts);
    return <SubscriptionStatsPanel stats={subs} currency={overview.currency} />;
  } catch (err) {
    return <AnalyticsSectionError message={sectionErrorMessage(err)} />;
  }
}

export async function AnalyticsDiscountsSection() {
  try {
    const [opts, overview] = await Promise.all([
      getAdminApiOpts(),
      loadAdminAnalyticsOverview(),
    ]);
    const discounts = await adminAnalyticsDiscounts(opts);
    return (
      <DiscountStatsPanel
        items={discounts.items}
        currency={overview.currency}
      />
    );
  } catch (err) {
    return <AnalyticsSectionError message={sectionErrorMessage(err)} />;
  }
}
