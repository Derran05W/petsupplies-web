import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import type { AdminAnalyticsOverview } from '@/types/admin-analytics';
import { formatPrice } from '@/lib/utils/format';
import { StatCard } from '@/components/admin/dashboard/StatCard';

interface AnalyticsOverviewCardsProps {
  overview: AdminAnalyticsOverview;
}

/**
 * KPI row from GET /admin/analytics/overview.
 */
export function AnalyticsOverviewCards({
  overview,
}: AnalyticsOverviewCardsProps) {
  const { currency, revenueCents, ordersCount, customersCount, aovCents } =
    overview;

  return (
    <section
      aria-label="Analytics overview"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        label="Revenue"
        value={formatPrice(revenueCents, currency)}
        icon={DollarSign}
        deltaPercent={null}
      />
      <StatCard
        label="Orders"
        value={String(ordersCount)}
        icon={ShoppingBag}
        deltaPercent={null}
      />
      <StatCard
        label="Customers"
        value={String(customersCount)}
        icon={Users}
        deltaPercent={null}
      />
      <StatCard
        label="Avg order value"
        value={formatPrice(aovCents, currency)}
        icon={TrendingUp}
        deltaPercent={null}
      />
    </section>
  );
}
