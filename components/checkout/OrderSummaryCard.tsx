import { brand } from '@/lib/config/brand';
import { OrderReceiptBody } from '@/components/checkout/OrderReceiptBody';
import { Button, TONE_CLASSES } from '@/components/ui';
import type { OrderSummary } from '@/types/order';

interface OrderSummaryCardProps {
  order: OrderSummary;
}

/**
 * Server-safe presentational card for the confirmed order. Used by the
 * `/checkout/success` page after the polling hook returns a non-null
 * `OrderSummary`. No state, no hooks — easy to reuse on `/account/orders/[id]`
 * in Phase 7.
 */
export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
    <article
      aria-label="Order summary"
      className="w-full max-w-2xl rounded-card border border-line bg-paper px-6 py-8 md:px-10 md:py-10"
    >
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden
          className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.sage}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <h1 className="font-display text-display text-ink">
          Thank you for your order.
        </h1>
        {order.email ? (
          <p className="font-body text-sm leading-body text-ink-secondary">
            We&apos;ve emailed a receipt to{' '}
            <span className="font-medium text-ink">{order.email}</span>.
          </p>
        ) : null}
        <span className="mt-1 inline-flex items-center rounded-tag border border-line bg-panel px-3 py-1 font-body text-micro uppercase text-ink-muted">
          Order #{order.id.slice(-8)}
        </span>
      </header>

      <OrderReceiptBody order={order} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/products" className="flex-1 px-5 py-2.5">
          Continue shopping
        </Button>
        <Button
          variant="ghost"
          href={`/account/orders/${order.id}`}
          className="flex-1 px-5 py-2.5"
        >
          View in your account
        </Button>
      </div>

      <p className="mt-4 text-center font-body text-xs text-ink-faint">
        Questions? Email{' '}
        <a
          href={`mailto:${brand.supportEmail}`}
          className="text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          {brand.supportEmail}
        </a>
        .
      </p>
    </article>
  );
}
