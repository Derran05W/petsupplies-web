import Image from 'next/image';
import { SubscriptionStatusPill } from '@/components/account/subscriptions/SubscriptionStatusPill';
import { SubscriptionActions } from '@/components/account/subscriptions/SubscriptionActions';
import type { Subscription } from '@/types/subscription';
import { SUBSCRIPTION_INTERVAL_LABEL } from '@/types/subscription';
import { formatDate, formatPrice } from '@/lib/utils/format';

const FALLBACK_IMG = '/images/hero-placeholder.jpg';

interface SubscriptionCardProps {
  subscription: Subscription;
}

function periodEndIsoToYyyyMmDd(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const img =
    subscription.productImageUrl.trim().length > 0
      ? subscription.productImageUrl
      : FALLBACK_IMG;
  const isRemote = /^https?:\/\//i.test(img);

  return (
    <li className="overflow-hidden rounded-card border border-line bg-paper">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative mx-auto aspect-square w-full shrink-0 overflow-hidden rounded-tile bg-panel sm:mx-0 sm:size-28">
          <Image
            src={img}
            alt={subscription.productName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 7rem"
            unoptimized={isRemote}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl tracking-[-0.01em] text-ink">
              {subscription.productName}
            </h2>
            <SubscriptionStatusPill status={subscription.status} />
          </div>

          <p className="font-body text-sm text-ink-muted">
            {subscription.quantity} ×{' '}
            {SUBSCRIPTION_INTERVAL_LABEL[subscription.interval]}
            <span aria-hidden className="mx-1.5 text-ink-faint">
              ·
            </span>
            {formatPrice(subscription.unitPriceCents)} each
          </p>

          {subscription.cancelAtPeriodEnd &&
          subscription.status !== 'canceled' ? (
            <p role="status" className="font-body text-sm text-amber">
              Cancels on{' '}
              <span className="font-medium">
                {periodEndIsoToYyyyMmDd(subscription.currentPeriodEnd)}
              </span>{' '}
              ({formatDate(subscription.currentPeriodEnd)})
            </p>
          ) : subscription.status !== 'canceled' ? (
            <p className="font-body text-sm text-ink-muted">
              Next period ends{' '}
              <time dateTime={subscription.currentPeriodEnd}>
                {formatDate(subscription.currentPeriodEnd)}
              </time>
            </p>
          ) : (
            <p className="font-body text-sm text-ink-muted">
              No upcoming deliveries — this subscription has ended.
            </p>
          )}

          <SubscriptionActions subscription={subscription} />
        </div>
      </div>
    </li>
  );
}
