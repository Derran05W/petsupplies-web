import Image from 'next/image';
import Link from 'next/link';
import { brand } from '@/lib/config/brand';
import { formatPrice } from '@/lib/utils/format';
import type { OrderSummary } from '@/types/order';

interface OrderSummaryCardProps {
  order: OrderSummary;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

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
      className="w-full max-w-2xl rounded-2xl border border-warm-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10"
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

      <div className="mt-8 border-t border-warm-200 pt-6">
        <h2 className="mb-4 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
          Items
        </h2>
        <ul className="flex flex-col divide-y divide-warm-200">
          {order.lines.map((line) => (
            <li key={line.id} className="flex gap-4 py-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-warm-100">
                <Image
                  src={
                    line.imageUrl.length > 0 ? line.imageUrl : FALLBACK_IMAGE
                  }
                  alt={line.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="truncate font-body text-sm font-medium text-warm-900">
                  {line.name}
                </p>
                <p className="font-body text-xs text-warm-600">
                  Qty {line.quantity} · {formatPrice(line.unitPriceCents)}
                </p>
              </div>
              <p className="font-body text-sm font-medium text-warm-900">
                {formatPrice(line.lineTotalCents)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-warm-200 pt-6 font-body text-sm">
        <div className="flex items-center justify-between">
          <span className="text-warm-600">Subtotal</span>
          <span className="font-medium text-warm-900">
            {formatPrice(order.subtotalCents, order.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-warm-600">Shipping</span>
          <span className="font-medium text-warm-900">
            {order.shippingCents === 0
              ? 'Free'
              : formatPrice(order.shippingCents, order.currency)}
          </span>
        </div>
        {order.taxCents > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-warm-600">Tax</span>
            <span className="font-medium text-warm-900">
              {formatPrice(order.taxCents, order.currency)}
            </span>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between border-t border-warm-200 pt-3">
          <span className="font-display text-base text-warm-900">Total</span>
          <span className="font-display text-2xl tracking-[-0.02em] text-warm-900">
            {formatPrice(order.totalCents, order.currency)}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-warm-200 pt-6">
        <h2 className="mb-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
          Shipping to
        </h2>
        <address className="font-body text-sm not-italic leading-relaxed text-warm-900">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? (
            <>
              <br />
              {order.shippingAddress.line2}
            </>
          ) : null}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
          {order.shippingAddress.postalCode}
          <br />
          {order.shippingAddress.country}
        </address>
      </div>

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
