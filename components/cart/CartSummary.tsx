'use client';

import Link from 'next/link';
import { useCartSubtotalCents } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { FreeShippingProgress } from './FreeShippingProgress';

interface CartSummaryProps {
  /**
   * `'drawer'` shows a "Continue shopping" button that closes the drawer
   * via `onClose`. `'page'` shows a "Continue shopping" link that
   * navigates to /products.
   */
  variant: 'drawer' | 'page';
  onClose?: () => void;
}

export function CartSummary({ variant, onClose }: CartSummaryProps) {
  const subtotalCents = useCartSubtotalCents();

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-white p-5">
      <div className="flex items-center justify-between font-body text-sm">
        <span className="text-warm-600">Subtotal</span>
        <span className="font-medium text-warm-900">
          {formatPrice(subtotalCents)}
        </span>
      </div>

      <FreeShippingProgress />

      <p className="font-body text-xs text-warm-600">
        Taxes and shipping calculated at checkout.
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
