'use client';

import { useMemo } from 'react';
import { useCartStore, type CartLine } from '@/lib/store/cart';
import { useFreeShippingThresholdCents } from '@/components/providers/FreeShippingThresholdProvider';

/**
 * Narrow selector hooks for the cart store. Each subscribes to the
 * smallest slice possible so consumers don't re-render on unrelated
 * state changes (e.g. the cart icon doesn't re-render when an item's
 * quantity changes — only when the total count changes).
 */

export function useCartLines(): CartLine[] {
  return useCartStore((state) => state.lines);
}

export function useCartCount(): number {
  return useCartStore((state) =>
    state.lines.reduce((acc, line) => acc + line.quantity, 0),
  );
}

export function useCartSubtotalCents(): number {
  return useCartStore((state) =>
    state.lines.reduce((acc, line) => acc + line.priceCents * line.quantity, 0),
  );
}

export function useCartHasHydrated(): boolean {
  return useCartStore((state) => state.hasHydrated);
}

export function useCartBumpCounter(): number {
  return useCartStore((state) => state.bumpCounter);
}

export function useCartLastRemovedAt(): number {
  return useCartStore((state) => state.lastRemovedAt);
}

export interface CartActions {
  add: ReturnType<typeof useCartStore.getState>['add'];
  remove: ReturnType<typeof useCartStore.getState>['remove'];
  setQuantity: ReturnType<typeof useCartStore.getState>['setQuantity'];
  increment: ReturnType<typeof useCartStore.getState>['increment'];
  decrement: ReturnType<typeof useCartStore.getState>['decrement'];
  clear: ReturnType<typeof useCartStore.getState>['clear'];
}

/**
 * Returns the action functions only, memoised so consumers don't churn
 * on every render. Action references on the Zustand store are stable
 * for the lifetime of the store, so the dependency array is empty.
 */
export function useCartActions(): CartActions {
  const add = useCartStore((state) => state.add);
  const remove = useCartStore((state) => state.remove);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const clear = useCartStore((state) => state.clear);

  return useMemo(
    () => ({ add, remove, setQuantity, increment, decrement, clear }),
    [add, remove, setQuantity, increment, decrement, clear],
  );
}

export interface FreeShippingProgress {
  thresholdCents: number;
  subtotalCents: number;
  remainingCents: number;
  /** 0..1, clamped. */
  progress: number;
  qualifies: boolean;
}

export function useFreeShippingProgress(): FreeShippingProgress {
  const subtotalCents = useCartSubtotalCents();
  const thresholdCents = useFreeShippingThresholdCents();

  const remainingCents = Math.max(0, thresholdCents - subtotalCents);
  const qualifies = subtotalCents >= thresholdCents;
  const progress =
    thresholdCents <= 0 ? 1 : Math.min(1, subtotalCents / thresholdCents);

  return {
    thresholdCents,
    subtotalCents,
    remainingCents,
    progress,
    qualifies,
  };
}
