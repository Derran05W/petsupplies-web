'use client';

import Image from 'next/image';
import {
  useCartLines,
  useCartSubtotalCents,
  useCartTotals,
  useFreeShippingProgress,
} from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress';
import { RewardProgress } from '@/components/cart/RewardProgress';
import { DiscountCodeForm } from '@/components/cart/DiscountCodeForm';

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

interface CheckoutSummaryProps {
  selectedShippingCents?: number | null;
}

export function CheckoutSummary({
  selectedShippingCents = null,
}: CheckoutSummaryProps) {
  const lines = useCartLines();
  const subtotalCents = useCartSubtotalCents();
  const totals = useCartTotals();
  const { qualifies } = useFreeShippingProgress();

  const discountCents = totals?.appliedDiscountCents ?? 0;
  const serverShippingCents = totals?.shippingCents;
  const shippingLabel = (() => {
    if (qualifies || totals?.discountType === 'FREE_SHIPPING') return 'Free';
    if (selectedShippingCents !== null) {
      return selectedShippingCents === 0
        ? 'Free'
        : formatPrice(selectedShippingCents);
    }
    if (serverShippingCents !== undefined) {
      return serverShippingCents === 0
        ? 'Free'
        : formatPrice(serverShippingCents);
    }
    return qualifies ? 'Free' : 'Calculated at payment';
  })();

  const totalCents =
    totals?.totalCents ??
    subtotalCents -
      discountCents +
      (selectedShippingCents ?? (qualifies ? 0 : 0));

  return (
    <aside
      aria-label="Order summary"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <div className="flex flex-col gap-5 rounded-card border border-line bg-panel p-5">
        <h2 className="font-display text-title text-ink">Order summary</h2>

        <ul className="flex flex-col gap-4">
          {lines.map((line) => (
            <li key={line.cartItemId ?? line.productId} className="flex gap-3">
              <div className="bg-ink/5 relative size-14 shrink-0 overflow-hidden rounded-tile">
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
                  className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-pill bg-ink font-body text-[10px] font-medium text-paper"
                >
                  {line.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                <p className="truncate font-body text-sm font-medium text-ink">
                  {line.name}
                </p>
                <p className="font-body text-xs text-ink-muted">
                  Qty {line.quantity}
                </p>
              </div>
              <p className="font-body text-sm font-medium text-ink">
                {formatPrice(line.priceCents * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-t border-line" />

        <div className="flex flex-col gap-3 font-body text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Subtotal</span>
            <span className="font-medium text-ink">
              {formatPrice(subtotalCents)}
            </span>
          </div>
          {discountCents > 0 ? (
            <div className="flex items-center justify-between text-pine">
              <span>
                Discount
                {totals?.discountCode ? ` (${totals.discountCode})` : ''}
              </span>
              <span>-{formatPrice(discountCents)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Shipping</span>
            <span className="font-medium text-ink">{shippingLabel}</span>
          </div>
        </div>

        <DiscountCodeForm compact className="lg:hidden" />

        <FreeShippingProgress />

        <RewardProgress />

        <p className="font-body text-xs text-ink-muted">
          Taxes calculated by Stripe at the next step.
        </p>

        <div className="border-t border-line" />

        <div className="flex items-baseline justify-between">
          <span className="font-display text-base text-ink">Total</span>
          <span className="font-display text-title text-ink">
            {formatPrice(totalCents)}
          </span>
        </div>
      </div>
    </aside>
  );
}
