import Link from 'next/link';
import { Heart } from 'lucide-react';

/**
 * Empty wishlist — mirrors {@link OrdersEmpty} pattern.
 */
export function WishlistEmpty() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-warm-300 bg-surface-card px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-full bg-warm-100 text-warm-600"
      >
        <Heart size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
          Your wishlist is empty
        </h2>
        <p className="max-w-sm font-body text-sm text-warm-600">
          Save products you love — they&apos;ll show up here for quick access
          and easy checkout.
        </p>
      </div>
      <Link
        href="/products"
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
      >
        Browse products
      </Link>
    </section>
  );
}
