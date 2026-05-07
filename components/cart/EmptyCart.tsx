import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

interface EmptyCartProps {
  /**
   * Variant. The drawer is constrained vertically so the empty state
   * paints with less padding; the full /cart page gets the airy version.
   */
  variant?: 'page' | 'drawer';
  /**
   * If the empty state lives inside the drawer, the "Browse products" CTA
   * should also close the drawer on click. Provided by the drawer wrapper.
   */
  onBrowse?: () => void;
}

export function EmptyCart({ variant = 'page', onBrowse }: EmptyCartProps) {
  const isDrawer = variant === 'drawer';

  return (
    <div
      className={
        isDrawer
          ? 'flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center'
          : 'flex flex-col items-center justify-center gap-5 rounded-2xl bg-warm-100 px-6 py-16 text-center md:py-24'
      }
    >
      <span
        aria-hidden
        className="inline-flex size-14 items-center justify-center rounded-full bg-warm-200 text-warm-600"
      >
        <ShoppingBag size={22} />
      </span>
      <h2 className="font-display text-2xl tracking-[-0.02em] text-warm-900 md:text-3xl">
        Your cart is feeling empty.
      </h2>
      <p className="max-w-sm font-body text-sm text-warm-600">
        Once you find something tasty, it&apos;ll show up here. Browse the shop
        to get started.
      </p>
      <Link
        href="/products"
        onClick={onBrowse}
        className="inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
      >
        Browse products
      </Link>
    </div>
  );
}
