import type { AdminAnalyticsSubscriptions } from '@/types/admin-analytics';
import { formatPrice } from '@/lib/utils/format';

interface SubscriptionStatsPanelProps {
  stats: AdminAnalyticsSubscriptions;
  currency: string;
}

export function SubscriptionStatsPanel({
  stats,
  currency,
}: SubscriptionStatsPanelProps) {
  return (
    <section
      aria-label="Subscription analytics"
      className="rounded-2xl border border-warm-200 bg-white p-5"
    >
      <h2 className="font-display text-lg tracking-tight text-warm-900">
        Subscriptions
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
            Active
          </dt>
          <dd className="mt-1 font-display text-2xl text-warm-900">
            {stats.activeCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
            Paused
          </dt>
          <dd className="mt-1 font-display text-2xl text-warm-900">
            {stats.pausedCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
            Cancelled
          </dt>
          <dd className="mt-1 font-display text-2xl text-warm-900">
            {stats.cancelledCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
            Est. MRR
          </dt>
          <dd className="mt-1 font-body text-lg font-semibold text-warm-900">
            {formatPrice(stats.mrrCents, currency)}
          </dd>
        </div>
        {stats.churnPercent !== undefined && (
          <div>
            <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
              Churn
            </dt>
            <dd className="mt-1 font-body text-lg font-semibold text-warm-900">
              {stats.churnPercent}%
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
