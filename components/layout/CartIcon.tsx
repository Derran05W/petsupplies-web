'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartIconProps {
  /**
   * Item count badge. Phase 5 will wire this from the Zustand cart
   * store; for now the parent passes a static 0.
   */
  count?: number;
  className?: string;
}

export function CartIcon({ count = 0, className }: CartIconProps) {
  const hasItems = count > 0;
  const label = hasItems
    ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}`
    : 'Cart';

  return (
    <Link
      href="/cart"
      aria-label={label}
      className={cn(
        'relative inline-flex size-9 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100',
        className,
      )}
    >
      <ShoppingBag size={18} aria-hidden />
      {hasItems && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand-400 px-1 font-body text-[10px] font-medium leading-[18px] text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
