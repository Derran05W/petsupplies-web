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
      className="rounded-card border border-line bg-panel p-5"
    >
      <h2 className="font-display text-xl text-ink">Subscriptions</h2>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="font-body text-micro uppercase text-ink-muted">
            Active
          </dt>
          <dd className="mt-1 font-display text-2xl text-ink">
            {stats.activeCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-micro uppercase text-ink-muted">
            Paused
          </dt>
          <dd className="mt-1 font-display text-2xl text-ink">
            {stats.pausedCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-micro uppercase text-ink-muted">
            Cancelled
          </dt>
          <dd className="mt-1 font-display text-2xl text-ink">
            {stats.cancelledCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-micro uppercase text-ink-muted">
            Est. MRR
          </dt>
          <dd className="mt-1 font-display text-lg text-ink">
            {formatPrice(stats.mrrCents, currency)}
          </dd>
        </div>
        {stats.churnPercent !== undefined && (
          <div>
            <dt className="font-body text-micro uppercase text-ink-muted">
              Churn
            </dt>
            <dd className="mt-1 font-display text-lg text-ink">
              {stats.churnPercent}%
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
