import Image from 'next/image';
import type { Subscription } from '@/types/subscription';
import {
  SUBSCRIPTION_INTERVAL_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
} from '@/types/subscription';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface CustomerSubscriptionsListProps {
  subscriptions: Subscription[];
}

const PLACEHOLDER = '/images/hero-placeholder.jpg';

export function CustomerSubscriptionsList({
  subscriptions,
}: CustomerSubscriptionsListProps) {
  if (subscriptions.length === 0) {
    return (
      <p className="rounded-card border border-line bg-paper px-5 py-8 text-center font-body text-sm text-ink-secondary">
        No subscriptions for this customer.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {subscriptions.map((sub) => (
        <li
          key={sub.id}
          className="flex gap-4 rounded-card border border-line bg-paper p-4"
        >
          <div className="relative size-16 shrink-0 overflow-hidden rounded-tile bg-panel">
            <Image
              src={
                sub.productImageUrl?.length ? sub.productImageUrl : PLACEHOLDER
              }
              alt=""
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-sm font-semibold text-ink">
              {sub.productName}
            </p>
            <p className="mt-1 font-body text-xs text-ink-muted">
              {SUBSCRIPTION_INTERVAL_LABEL[sub.interval]} · Qty {sub.quantity}
            </p>
            <p className="mt-1 font-body text-xs text-ink-muted">
              {SUBSCRIPTION_STATUS_LABEL[sub.status]} ·{' '}
              {formatPrice(sub.unitPriceCents, 'usd')} / shipment
            </p>
            <p className="mt-1 font-body text-xs text-ink-faint">
              Next / end: {formatDate(sub.currentPeriodEnd)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
