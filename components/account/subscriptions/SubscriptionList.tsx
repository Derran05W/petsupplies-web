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
        className="rounded-2xl border border-red-200 bg-red-50 px-6 py-6 font-body text-sm text-red-800"
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
          className="text-brand-900 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 font-body text-sm"
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
