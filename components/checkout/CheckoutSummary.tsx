'use client';

import Image from 'next/image';
import {
  useCartLines,
  useCartSubtotalCents,
  useFreeShippingProgress,
} from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress';

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

/**
 * Sticky right-rail summary on `/checkout`. Mirrors the look of
 * `<CartSummary />` but renders the actual line items (with thumbnails
 * + qty pills) above the totals so the customer sees exactly what
 * they're about to pay for.
 *
 * The displayed pricing is the cart snapshot — instant render, no extra
 * round trip. Backend re-validates against live prices and stock when it
 * creates the Stripe Checkout Session, so what the customer actually
 * pays at Stripe is the source of truth.
 */
export function CheckoutSummary() {
  const lines = useCartLines();
  const subtotalCents = useCartSubtotalCents();
  const { qualifies } = useFreeShippingProgress();

  return (
    <aside
      aria-label="Order summary"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <div className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-surface-card p-5">
        <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
          Order summary
        </h2>

        <ul className="flex flex-col gap-4">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-warm-100">
                <Image
                  src={
                    line.imageUrl.length > 0 ? line.imageUrl : FALLBACK_IMAGE
                  }
                  alt={line.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-warm-900 font-body text-[10px] font-medium text-white"
                >
                  {line.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                <p className="truncate font-body text-sm font-medium text-warm-900">
                  {line.name}
                </p>
                <p className="font-body text-xs text-warm-600">
                  Qty {line.quantity}
                </p>
              </div>
              <p className="font-body text-sm font-medium text-warm-900">
                {formatPrice(line.priceCents * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-t border-warm-200" />

        <div className="flex flex-col gap-3 font-body text-sm">
          <div className="flex items-center justify-between">
            <span className="text-warm-600">Subtotal</span>
            <span className="font-medium text-warm-900">
              {formatPrice(subtotalCents)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-warm-600">Shipping</span>
            <span className="font-medium text-warm-900">
              {qualifies ? 'Free' : 'Calculated at payment'}
            </span>
          </div>
        </div>

        <FreeShippingProgress />

        <p className="font-body text-xs text-warm-600">
          Taxes calculated by Stripe at the next step.
        </p>

        <div className="border-t border-warm-200" />

        <div className="flex items-baseline justify-between">
          <span className="font-display text-base text-warm-900">Total</span>
          <span className="font-display text-2xl tracking-[-0.02em] text-warm-900">
            {formatPrice(subtotalCents)}
          </span>
        </div>
      </div>
    </aside>
  );
}
