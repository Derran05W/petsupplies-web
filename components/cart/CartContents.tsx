'use client';

import { useCartHasHydrated, useCartLines } from '@/hooks/useCart';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { EmptyCart } from './EmptyCart';

interface CartContentsProps {
  /**
   * `'drawer'` lays out the lines + summary stacked vertically inside the
   * drawer panel. `'page'` lays them out as a two-column grid on lg+ with
   * a sticky summary, stacked on mobile.
   */
  variant: 'drawer' | 'page';
  /** Drawer-only — closes the drawer when CTAs are tapped. */
  onClose?: () => void;
}

/**
 * Renders the lines list + summary used by both the desktop drawer and
 * the /cart full page. Reads from the Zustand store directly, which is
 * why this stays a client component even when mounted by a server page.
 */
export function CartContents({ variant, onClose }: CartContentsProps) {
  const hasHydrated = useCartHasHydrated();
  const lines = useCartLines();

  if (!hasHydrated) {
    return <CartContentsSkeleton variant={variant} />;
  }

  if (lines.length === 0) {
    return (
      <EmptyCart
        variant={variant === 'drawer' ? 'drawer' : 'page'}
        {...(onClose ? { onBrowse: onClose } : {})}
      />
    );
  }

  if (variant === 'drawer') {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-surface-drawer">
        <ul className="flex flex-1 flex-col divide-y divide-warm-200 overflow-y-auto px-6">
          {lines.map((line) => (
            <CartItem
              key={line.productId}
              line={line}
              {...(onClose ? { onNavigate: onClose } : {})}
            />
          ))}
        </ul>
        <div className="shrink-0 border-t border-warm-200 bg-surface-drawer p-5">
          <CartSummary variant="drawer" {...(onClose ? { onClose } : {})} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-2xl border border-warm-200 bg-surface-card">
        <ul className="flex flex-col divide-y divide-warm-200 px-5">
          {lines.map((line) => (
            <CartItem key={line.productId} line={line} />
          ))}
        </ul>
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <CartSummary variant="page" />
      </div>
    </div>
  );
}

function CartContentsSkeleton({ variant }: { variant: 'drawer' | 'page' }) {
  if (variant === 'drawer') {
    return (
      <div
        aria-hidden
        className="flex flex-1 flex-col gap-4 overflow-hidden px-6 py-6"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex gap-4 rounded-lg border border-warm-200 p-3"
          >
            <div className="size-20 shrink-0 animate-pulse rounded-lg bg-warm-100" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-warm-100" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-warm-100" />
              <div className="mt-auto h-6 w-24 animate-pulse rounded bg-warm-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4 rounded-2xl border border-warm-200 bg-surface-card p-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="size-20 shrink-0 animate-pulse rounded-lg bg-warm-100" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-warm-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-warm-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-warm-200 bg-surface-card" />
    </div>
  );
}
