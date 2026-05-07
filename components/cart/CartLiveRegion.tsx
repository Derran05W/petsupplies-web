'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useCartBumpCounter,
  useCartHasHydrated,
  useCartLastRemovedAt,
} from '@/hooks/useCart';

/**
 * Hidden polite live region that announces "Added to cart" / "Removed
 * from cart" to assistive tech as the user manipulates the cart from
 * any surface (PDP, drawer, /cart page).
 *
 * Mounted once at the top of the navbar shell so the announcer survives
 * drawer open/close and route navigations within the shop layout.
 *
 * The blank-then-set pattern (clear the message before setting the new
 * one) is the standard trick to force screen readers to re-announce
 * even when the same string fires twice in a row.
 */
export function CartLiveRegion() {
  const hasHydrated = useCartHasHydrated();
  const bumpCounter = useCartBumpCounter();
  const lastRemovedAt = useCartLastRemovedAt();
  const [message, setMessage] = useState('');
  const initialBumpRef = useRef<number | null>(null);
  const initialRemovedRef = useRef<number | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current !== null) clearTimeout(clearTimerRef.current);
    };
  }, []);

  function announce(next: string) {
    setMessage('');
    if (clearTimerRef.current !== null) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setMessage(next), 50);
  }

  useEffect(() => {
    if (!hasHydrated) return;
    if (initialBumpRef.current === null) {
      initialBumpRef.current = bumpCounter;
      return;
    }
    if (bumpCounter !== initialBumpRef.current) {
      initialBumpRef.current = bumpCounter;
      announce('Added to cart.');
    }
  }, [bumpCounter, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (initialRemovedRef.current === null) {
      initialRemovedRef.current = lastRemovedAt;
      return;
    }
    if (lastRemovedAt !== initialRemovedRef.current && lastRemovedAt > 0) {
      initialRemovedRef.current = lastRemovedAt;
      announce('Removed from cart.');
    }
  }, [lastRemovedAt, hasHydrated]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
