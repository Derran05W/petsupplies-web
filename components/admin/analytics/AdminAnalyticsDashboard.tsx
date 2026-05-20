import { Suspense } from 'react';
import { RevenueChartClient } from './RevenueChartClient';
import {
  AnalyticsOverviewSkeleton,
  AnalyticsPanelSkeleton,
} from './AdminAnalyticsSkeletons';
import {
  AnalyticsDiscountsSection,
  AnalyticsLowStockSection,
  AnalyticsOverviewSection,
  AnalyticsSubscriptionsSection,
  AnalyticsTopProductsSection,
} from './AdminAnalyticsSections';

/**
 * Analytics hub layout. Shell (banner + heading) renders on the page;
 * each block streams in behind its own Suspense boundary.
 */
export function AdminAnalyticsDashboard() {
  return (
    <>
      <Suspense fallback={<AnalyticsOverviewSkeleton />}>
        <AnalyticsOverviewSection />
      </Suspense>

      <div className="mt-8">
        <RevenueChartClient />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Suspense
          fallback={<AnalyticsPanelSkeleton title="Top products" rows={5} />}
        >
          <AnalyticsTopProductsSection />
        </Suspense>
        <Suspense
          fallback={<AnalyticsPanelSkeleton title="Low stock" rows={5} />}
        >
          <AnalyticsLowStockSection />
        </Suspense>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <Suspense
          fallback={<AnalyticsPanelSkeleton title="Subscriptions" rows={3} />}
        >
          <AnalyticsSubscriptionsSection />
        </Suspense>
        <Suspense
          fallback={<AnalyticsPanelSkeleton title="Discounts" rows={4} />}
        >
          <AnalyticsDiscountsSection />
        </Suspense>
      </div>
    </>
  );
}
