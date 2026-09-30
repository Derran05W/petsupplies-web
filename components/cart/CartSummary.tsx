'use client';

import { useCartSubtotalCents, useCartTotals } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/components/ui';
import { FreeShippingProgress } from './FreeShippingProgress';
import { RewardProgress } from './RewardProgress';
import { DiscountCodeForm } from './DiscountCodeForm';

interface CartSummaryProps {
  variant: 'drawer' | 'page';
  onClose?: () => void;
}

/**
 * Totals block in the boutique treatment: panel-toned card with hairline
 * rules, Archivo rows, Fraunces total, and pill CTAs.
 */
export function CartSummary({ variant, onClose }: CartSummaryProps) {
  const subtotalCents = useCartSubtotalCents();
  const totals = useCartTotals();

  const discountCents = totals?.appliedDiscountCents ?? 0;
  const shippingCents = totals?.shippingCents;
  const totalCents = totals?.totalCents ?? subtotalCents;

  return (
    <div className="flex flex-col gap-5 rounded-card border border-line bg-panel p-5">
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
        {shippingCents !== undefined ? (
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Shipping</span>
            <span className="font-medium text-ink">
              {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
            </span>
          </div>
        ) : null}
        {totals ? (
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="font-medium text-ink">Estimated total</span>
            <span className="font-display text-xl text-ink">
              {formatPrice(totalCents)}
            </span>
          </div>
        ) : null}
      </div>

      <DiscountCodeForm compact />

      <FreeShippingProgress />

      <RewardProgress />

      <p className="font-body text-xs text-ink-muted">
        {totals
          ? 'Shipping and tax finalized at checkout.'
          : 'Taxes and shipping calculated at checkout.'}
      </p>

      <Button href="/checkout" className="w-full px-5 py-3.5">
        Continue to checkout
      </Button>

      {variant === 'drawer' ? (
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full px-5 py-3.5"
        >
          Continue shopping
        </Button>
      ) : (
        <Button variant="ghost" href="/products" className="w-full px-5 py-3.5">
          Continue shopping
        </Button>
      )}
    </div>
  );
}
