'use client';

import Link from 'next/link';
import { useCartSubtotalCents, useCartTotals } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { FreeShippingProgress } from './FreeShippingProgress';
import { DiscountCodeForm } from './DiscountCodeForm';

interface CartSummaryProps {
  variant: 'drawer' | 'page';
  onClose?: () => void;
}

export function CartSummary({ variant, onClose }: CartSummaryProps) {
  const subtotalCents = useCartSubtotalCents();
  const totals = useCartTotals();

  const discountCents = totals?.appliedDiscountCents ?? 0;
  const shippingCents = totals?.shippingCents;
  const totalCents = totals?.totalCents ?? subtotalCents;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-warm-100 p-5">
      <div className="flex flex-col gap-3 font-body text-sm">
        <div className="flex items-center justify-between">
          <span className="text-warm-600">Subtotal</span>
          <span className="font-medium text-warm-900">
            {formatPrice(subtotalCents)}
          </span>
        </div>
        {discountCents > 0 ? (
          <div className="flex items-center justify-between text-brand-700">
            <span>
              Discount
              {totals?.discountCode ? ` (${totals.discountCode})` : ''}
            </span>
            <span>-{formatPrice(discountCents)}</span>
          </div>
        ) : null}
        {shippingCents !== undefined ? (
          <div className="flex items-center justify-between">
            <span className="text-warm-600">Shipping</span>
            <span className="font-medium text-warm-900">
              {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
            </span>
          </div>
        ) : null}
        {totals ? (
          <div className="flex items-center justify-between border-t border-warm-200 pt-3">
            <span className="font-medium text-warm-900">Estimated total</span>
            <span className="font-display text-lg text-warm-900">
              {formatPrice(totalCents)}
            </span>
          </div>
        ) : null}
      </div>

      <DiscountCodeForm compact />

      <FreeShippingProgress />

      <p className="font-body text-xs text-warm-600">
        {totals
          ? 'Shipping and tax finalized at checkout.'
          : 'Taxes and shipping calculated at checkout.'}
      </p>

      <Link
        href="/checkout"
        className="inline-flex w-full items-center justify-center rounded-lg bg-brand-400 px-5 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
      >
        Continue to checkout
      </Link>

      {variant === 'drawer' ? (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          Continue shopping
        </button>
      ) : (
        <Link
          href="/products"
          className="inline-flex w-full items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          Continue shopping
        </Link>
      )}
    </div>
  );
}
