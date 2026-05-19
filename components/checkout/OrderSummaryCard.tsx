import Link from 'next/link';
import { brand } from '@/lib/config/brand';
import { OrderReceiptBody } from '@/components/checkout/OrderReceiptBody';
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
      className="w-full max-w-2xl rounded-2xl border border-warm-200 bg-surface-card px-6 py-8 shadow-sm md:px-10 md:py-10"
    >
      <header className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden
          className="inline-flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"
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
        <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900 md:text-4xl">
          Thank you for your order.
        </h1>
        <p className="font-body text-sm text-warm-600">
          We&apos;ve emailed a receipt to{' '}
          <span className="font-medium text-warm-900">{order.email}</span>.
        </p>
        <span className="mt-1 inline-flex items-center rounded-full bg-warm-100 px-3 py-1 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
          Order #{order.id.slice(-8)}
        </span>
      </header>

      <OrderReceiptBody order={order} />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
        >
          Continue shopping
        </Link>
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          View in your account
        </Link>
      </div>

      <p className="mt-4 text-center font-body text-xs text-warm-400">
        Questions? Email{' '}
        <a
          href={`mailto:${brand.supportEmail}`}
          className="text-warm-600 underline-offset-2 hover:text-warm-900 hover:underline"
        >
          {brand.supportEmail}
        </a>
        .
      </p>
    </article>
  );
}
