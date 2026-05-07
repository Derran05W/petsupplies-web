import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

/**
 * Empty-cart guard for `/checkout`. We don't redirect server-side because
 * the cart only exists on the client — a `redirect('/cart')` would loop
 * once the user lands on `/cart` (which itself reads the same store).
 *
 * Same warm-100 panel chrome as `<EmptyCart />` for visual consistency.
 */
export function EmptyCheckout() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl bg-warm-100 px-6 py-16 text-center md:py-24">
      <span
        aria-hidden
        className="inline-flex size-14 items-center justify-center rounded-full bg-warm-200 text-warm-600"
      >
        <ShoppingBag size={22} />
      </span>
      <h2 className="font-display text-2xl tracking-[-0.02em] text-warm-900 md:text-3xl">
        Nothing to check out yet.
      </h2>
      <p className="max-w-sm font-body text-sm text-warm-600">
        Add a few things to your cart and we&apos;ll meet you back here.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
      >
        Browse products
      </Link>
    </div>
  );
}
