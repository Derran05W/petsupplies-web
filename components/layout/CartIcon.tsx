'use client';

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from 'react';
import Link from 'next/link';
import {
  useCartBumpCounter,
  useCartCount,
  useCartHasHydrated,
} from '@/hooks/useCart';
import { NAV_LINK_CLASSES } from '@/components/ui';
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
 * Always-on-screen "Cart (n)" nav trigger, styled like the mockup's
 * uppercase nav text. Two presentations rendered side by side:
 *   - desktop (`hidden lg:inline-flex`): a `<button>` that opens the cart
 *     drawer via `onOpenDrawer`.
 *   - mobile (`lg:hidden`): a `<Link href="/cart">` that navigates to
 *     the full cart page.
 *
 * The count and bounce animation derive from the cart store. To avoid
 * SSR / hydration mismatches the count is only rendered once
 * `hasHydrated` flips true on the client.
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

    const label =
      hasHydrated && count > 0
        ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}`
        : 'Cart';

    const sharedClasses = cn(NAV_LINK_CLASSES, 'uppercase', className);

    // count changes are announced by the always-mounted CartLiveRegion; a live
    // region here would double-announce (this span renders desktop + mobile)
    const text = (
      <span
        className={cn(
          'inline-block whitespace-nowrap',
          bouncing ? 'animate-cart-bounce' : undefined,
        )}
      >
        {hasHydrated ? `Cart (${count})` : 'Cart'}
      </span>
    );

    return (
      <>
        <DesktopCartButton
          ref={ref}
          onClick={onOpenDrawer}
          aria-label={label}
          className={cn(sharedClasses, 'hidden lg:inline-block')}
        >
          {text}
        </DesktopCartButton>

        <Link
          href="/cart"
          aria-label={label}
          className={cn(sharedClasses, 'lg:hidden')}
        >
          {text}
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
