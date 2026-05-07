'use client';

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import {
  useCartBumpCounter,
  useCartCount,
  useCartHasHydrated,
} from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface CartIconProps {
  /**
   * Click handler for the desktop variant — opens `<CartDrawer />` from
   * the navbar shell. The mobile variant ignores this and navigates to
   * `/cart` instead via `<Link>`.
   */
  onOpenDrawer?: () => void;
  className?: string;
}

const BOUNCE_MS = 600;

/**
 * Always-on-screen cart trigger. Two presentations rendered side by side:
 *   - desktop (`hidden lg:inline-flex`): a `<button>` that opens the cart
 *     drawer via `onOpenDrawer`.
 *   - mobile (`lg:hidden`): a `<Link href="/cart">` that navigates to
 *     the full cart page.
 *
 * The badge count and bounce animation derive from the Zustand cart
 * store. To avoid SSR / hydration mismatches the badge is only rendered
 * once `hasHydrated` flips true on the client.
 */
export const CartIcon = forwardRef<HTMLButtonElement, CartIconProps>(
  function CartIcon({ onOpenDrawer, className }, ref) {
    const hasHydrated = useCartHasHydrated();
    const count = useCartCount();
    const bumpCounter = useCartBumpCounter();
    const [bouncing, setBouncing] = useState(false);
    const initialBumpRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      if (!hasHydrated) return;
      if (initialBumpRef.current === null) {
        initialBumpRef.current = bumpCounter;
        return;
      }
      if (bumpCounter !== initialBumpRef.current) {
        initialBumpRef.current = bumpCounter;
        setBouncing(true);
        if (timerRef.current !== null) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setBouncing(false), BOUNCE_MS);
      }
    }, [bumpCounter, hasHydrated]);

    useEffect(() => {
      return () => {
        if (timerRef.current !== null) clearTimeout(timerRef.current);
      };
    }, []);

    const showBadge = hasHydrated && count > 0;
    const label = showBadge
      ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}`
      : 'Cart';

    const sharedClasses =
      'relative inline-flex size-9 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100';

    return (
      <>
        <DesktopCartButton
          ref={ref}
          onClick={onOpenDrawer}
          aria-label={label}
          className={cn(sharedClasses, 'hidden lg:inline-flex', className)}
        >
          <CartGlyph bouncing={bouncing} />
          <CartBadge show={showBadge} count={count} />
        </DesktopCartButton>

        <Link
          href="/cart"
          aria-label={label}
          className={cn(sharedClasses, 'lg:hidden', className)}
        >
          <CartGlyph bouncing={bouncing} />
          <CartBadge show={showBadge} count={count} />
        </Link>
      </>
    );
  },
);

const DesktopCartButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function DesktopCartButton(props, ref) {
  return <button ref={ref} type="button" {...props} />;
});

function CartGlyph({ bouncing }: { bouncing: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex',
        bouncing ? 'animate-cart-bounce' : undefined,
      )}
    >
      <ShoppingBag size={18} />
    </span>
  );
}

function CartBadge({ show, count }: { show: boolean; count: number }) {
  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none absolute -right-1 -top-1"
    >
      {show ? (
        <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-400 px-1 font-body text-[10px] font-medium leading-none text-white">
          {count}
        </span>
      ) : null}
    </span>
  );
}
