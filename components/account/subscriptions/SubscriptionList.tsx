'use client';

import { useSearchParams } from 'next/navigation';
import { useSubscriptionsQuery } from '@/hooks/useSubscriptions';
import { SubscriptionCard } from '@/components/account/subscriptions/SubscriptionCard';
import { SubscriptionEmpty } from '@/components/account/subscriptions/SubscriptionEmpty';
import { SubscriptionSkeleton } from '@/components/account/subscriptions/SubscriptionSkeleton';

export function SubscriptionList() {
  const searchParams = useSearchParams();
  const checkoutSuccess =
    searchParams.get('checkout') === 'success' ||
    searchParams.get('status') === 'success';

  const { data, isLoading, isFetching, error, isSuccess } =
    useSubscriptionsQuery({ enabled: true });

  const hasRows = Boolean(data?.length);

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-card border border-danger-border bg-danger-surface px-6 py-6 font-body text-sm text-danger-solid"
      >
        {error.message || 'Something went wrong loading subscriptions.'}
      </div>
    );
  }

  if (isLoading && !hasRows && !error) {
    return <SubscriptionSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {checkoutSuccess ? (
        <div
          role="status"
          className="border-pine/40 rounded-tile border bg-tile-sage px-4 py-3 font-body text-sm text-tile-sage-ink"
        >
          Checkout finished — Stripe will finalize your Subscribe & Save plan
          momentarily.
          {(isFetching || isLoading) && ' Refreshing your list…'}
        </div>
      ) : null}

      {!hasRows && isSuccess ? (
        <SubscriptionEmpty />
      ) : (
        <ul className="flex flex-col gap-5">
          {data?.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} />
          ))}
        </ul>
      )}
    </div>
  );
}
