import Image from 'next/image';
import { formatPrice } from '@/lib/utils/format';
import type { OrderSummary } from '@/types/order';

interface OrderReceiptBodyProps {
  order: OrderSummary;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

/**
 * Items, totals, and shipping extracted from `<OrderSummaryCard />` so the same
 * receipt can render on Phase 11 email landing pages (`/email/orders/[id]`).
 */
export function OrderReceiptBody({ order }: OrderReceiptBodyProps) {
  return (
    <>
      <div className="mt-8 border-t border-line pt-6">
        <h2 className="mb-4 font-body text-micro uppercase text-ink-muted">
          Items
        </h2>
        <ul className="flex flex-col divide-y divide-line">
          {order.lines.map((line) => (
            <li key={line.id} className="flex gap-4 py-4">
              <div className="bg-ink/5 relative size-16 shrink-0 overflow-hidden rounded-tile">
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
                <p className="truncate font-body text-sm font-medium text-ink">
                  {line.name}
                </p>
                <p className="font-body text-xs text-ink-muted">
                  Qty {line.quantity} · {formatPrice(line.unitPriceCents)}
                </p>
              </div>
              <p className="font-body text-sm font-medium text-ink">
                {formatPrice(line.lineTotalCents)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-line pt-6 font-body text-sm">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Subtotal</span>
          <span className="font-medium text-ink">
            {formatPrice(order.subtotalCents, order.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Shipping</span>
          <span className="font-medium text-ink">
            {order.shippingCents === 0
              ? 'Free'
              : formatPrice(order.shippingCents, order.currency)}
          </span>
        </div>
        {order.taxCents > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Tax</span>
            <span className="font-medium text-ink">
              {formatPrice(order.taxCents, order.currency)}
            </span>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-display text-base text-ink">Total</span>
          <span className="font-display text-title text-ink">
            {formatPrice(order.totalCents, order.currency)}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <h2 className="mb-2 font-body text-micro uppercase text-ink-muted">
          Shipping to
        </h2>
        <address className="font-body text-sm not-italic leading-relaxed text-ink">
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
    </>
  );
}
