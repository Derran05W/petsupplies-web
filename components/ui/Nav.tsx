'use client';

import Link from 'next/link';
import { useCartCount, useCartHasHydrated } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

export interface NavLinkItem {
  label: string;
  href: string;
}

/** Announcement strip above the nav (`.topbar`): ink bar, centered uppercase label. */
export function TopBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-ink px-4 py-[0.55rem] text-center font-body text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-paper',
        className,
      )}
    >
      {children}
    </div>
  );
}

const NAV_LINK_CLASSES =
  'no-underline opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine';

interface NavProps {
  /** Italic Fraunces wordmark, centered (left-aligned below md). */
  wordmark: string;
  /** Left-side links; hidden below md per the mockup's 720px cutoff. */
  links: NavLinkItem[];
  /** When provided, "Search" renders as a button (e.g. opens SearchOverlay); otherwise links to /products. */
  onOpenSearch?: () => void;
  /** When provided, "Cart (n)" renders as a button (e.g. opens CartDrawer); otherwise links to /cart. */
  onOpenCart?: () => void;
  className?: string;
}

/**
 * Sticky boutique nav from the mockup: three-column grid (links · wordmark
 * · search/cart), 88%-opacity paper with 10px blur, hairline bottom border.
 * Text links sit at 75% opacity and sharpen on hover. The cart label reads
 * "Cart (n)" from the live cart (count appears after hydration to avoid
 * SSR mismatch).
 */
export function Nav({
  wordmark,
  links,
  onOpenSearch,
  onOpenCart,
  className,
}: NavProps) {
  const hasHydrated = useCartHasHydrated();
  const count = useCartCount();
  const cartLabel = hasHydrated ? `Cart (${count})` : 'Cart';

  return (
    <nav
      className={cn(
        'sticky top-0 z-[100] grid grid-cols-[auto_1fr] items-center gap-4 border-b border-line bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] px-gutter py-[1.05rem] backdrop-blur-[10px] md:grid-cols-[1fr_auto_1fr]',
        className,
      )}
    >
      <div className="hidden items-center gap-7 font-body text-label uppercase text-ink md:flex">
        {links.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={NAV_LINK_CLASSES}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="justify-self-start font-display text-2xl font-semibold italic text-ink no-underline md:justify-self-center"
      >
        {wordmark}
      </Link>
      <div className="flex items-center justify-end gap-7 font-body text-label uppercase text-ink">
        {onOpenSearch ? (
          <button
            type="button"
            onClick={onOpenSearch}
            className={cn(NAV_LINK_CLASSES, 'uppercase')}
          >
            Search
          </button>
        ) : (
          <Link href="/products" className={NAV_LINK_CLASSES}>
            Search
          </Link>
        )}
        {onOpenCart ? (
          <button
            type="button"
            onClick={onOpenCart}
            className={cn(NAV_LINK_CLASSES, 'uppercase')}
          >
            {cartLabel}
          </button>
        ) : (
          <Link href="/cart" className={NAV_LINK_CLASSES}>
            {cartLabel}
          </Link>
        )}
      </div>
    </nav>
  );
}
