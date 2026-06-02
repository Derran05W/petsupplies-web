'use client';

import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { CartTotals, CartViewLine } from '@/types/cart';
import { useCartStore, type CartLine, type CartState } from '@/lib/store/cart';
import { mapServerCartToViewLines } from '@/lib/cart/map-server-cart';
import { useFreeShippingThresholdCents } from '@/components/providers/FreeShippingThresholdProvider';
import { useAuth } from '@/hooks/useAuth';
import {
  useAddCartItemMutation,
  useApplyCartDiscountMutation,
  useClearServerCartMutation,
  useRemoveCartDiscountMutation,
  useRemoveCartItemMutation,
  useServerCartQuery,
  useUpdateCartItemMutation,
} from '@/hooks/useServerCart';

export type { CartViewLine, CartTotals };

function guestLineToViewLine(line: CartLine): CartViewLine {
  return {
    productId: line.productId,
    slug: line.slug,
    name: line.name,
    priceCents: line.priceCents,
    imageUrl: line.imageUrl,
    category: line.category,
    petType: line.petType,
    stockCount: line.stockCount,
    quantity: line.quantity,
    addedAt: line.addedAt,
  };
}

export function useCartMode(): 'guest' | 'server' {
  const { user } = useAuth();
  return user ? 'server' : 'guest';
}

export function useCartLines(): CartViewLine[] {
  const { user } = useAuth();
  const guestLines = useCartStore((state) => state.lines);
  const { data: serverCart } = useServerCartQuery();

  return useMemo(() => {
    if (user) {
      if (serverCart) {
        return mapServerCartToViewLines(serverCart);
      }
      return [];
    }
    return guestLines.map(guestLineToViewLine);
  }, [user, serverCart, guestLines]);
}

export function useCartCount(): number {
  const lines = useCartLines();
  return lines.reduce((acc, line) => acc + line.quantity, 0);
}

export function useCartSubtotalCents(): number {
  const mode = useCartMode();
  const guestSubtotal = useCartStore((state) =>
    state.lines.reduce((acc, line) => acc + line.priceCents * line.quantity, 0),
  );
  const { data: serverCart } = useServerCartQuery();
  if (mode === 'server' && serverCart) return serverCart.subtotalCents;
  return guestSubtotal;
}

export function useCartTotals(): CartTotals | null {
  const mode = useCartMode();
  const { data: serverCart } = useServerCartQuery();
  if (mode !== 'server' || !serverCart) return null;
  return {
    subtotalCents: serverCart.subtotalCents,
    appliedDiscountCents: serverCart.appliedDiscountCents,
    shippingCents: serverCart.shippingCents,
    totalCents: serverCart.totalCents,
    discountCode: serverCart.discountCode,
    discountType: serverCart.discountType,
    freeShippingThresholdCents: serverCart.freeShippingThresholdCents,
    freeShippingRemainingCents: serverCart.freeShippingRemainingCents,
    discountInvalidReason: serverCart.discountInvalidReason,
    discountInvalidCode: serverCart.discountInvalidCode,
  };
}

export function useCartHasHydrated(): boolean {
  const mode = useCartMode();
  const guestHydrated = useCartStore((state) => state.hasHydrated);
  const { isLoading, isFetching, data } = useServerCartQuery();
  if (mode === 'server') {
    return !isLoading && (!isFetching || data !== undefined);
  }
  return guestHydrated;
}

export function useCartBumpCounter(): number {
  return useCartStore((state) => state.bumpCounter);
}

export function useCartLastRemovedAt(): number {
  return useCartStore((state) => state.lastRemovedAt);
}

export interface CartActions {
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  replaceLines: CartState['replaceLines'];
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: () => Promise<void>;
}

export function useCartActions(): CartActions {
  const mode = useCartMode();
  const guestAdd = useCartStore((state) => state.add);
  const guestRemove = useCartStore((state) => state.remove);
  const guestSetQuantity = useCartStore((state) => state.setQuantity);
  const guestIncrement = useCartStore((state) => state.increment);
  const guestDecrement = useCartStore((state) => state.decrement);
  const guestClear = useCartStore((state) => state.clear);
  const guestReplaceLines = useCartStore((state) => state.replaceLines);
  const guestBump = useCartStore((state) => state.bump);
  const { data: serverCart } = useServerCartQuery();

  const addMutation = useAddCartItemMutation();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const applyDiscountMutation = useApplyCartDiscountMutation();
  const removeDiscountMutation = useRemoveCartDiscountMutation();
  const clearServerMutation = useClearServerCartMutation();

  const findServerItemId = (productId: string): string | undefined =>
    serverCart?.items.find((item) => item.productId === productId)?.id;

  return useMemo(
    () => ({
      add: (product, quantity = 1) => {
        if (mode === 'server') {
          void addMutation.mutateAsync({ product, quantity }).then(() => {
            guestBump();
          });
          return;
        }
        guestAdd(product, quantity);
      },
      remove: (productId) => {
        if (mode === 'server') {
          const cartItemId = findServerItemId(productId);
          if (cartItemId) void removeMutation.mutateAsync(cartItemId);
          return;
        }
        guestRemove(productId);
      },
      setQuantity: (productId, quantity) => {
        if (mode === 'server') {
          const cartItemId = findServerItemId(productId);
          if (cartItemId) {
            void updateMutation.mutateAsync({ cartItemId, quantity });
          }
          return;
        }
        guestSetQuantity(productId, quantity);
      },
      increment: (productId) => {
        if (mode === 'server') {
          const item = serverCart?.items.find((i) => i.productId === productId);
          if (item) {
            void updateMutation.mutateAsync({
              cartItemId: item.id,
              quantity: item.quantity + 1,
            });
          }
          return;
        }
        guestIncrement(productId);
      },
      decrement: (productId) => {
        if (mode === 'server') {
          const item = serverCart?.items.find((i) => i.productId === productId);
          if (!item) return;
          const next = item.quantity - 1;
          void updateMutation.mutateAsync({
            cartItemId: item.id,
            quantity: next,
          });
          return;
        }
        guestDecrement(productId);
      },
      clear: () => {
        if (mode === 'server') {
          void clearServerMutation.mutateAsync();
          return;
        }
        guestClear();
      },
      replaceLines: guestReplaceLines,
      applyDiscount: async (code) => {
        if (mode !== 'server') {
          throw new Error('Sign in to apply a discount code');
        }
        await applyDiscountMutation.mutateAsync(code);
      },
      removeDiscount: async () => {
        if (mode !== 'server') {
          throw new Error('Sign in to remove a discount code');
        }
        await removeDiscountMutation.mutateAsync();
      },
    }),
    [
      mode,
      guestAdd,
      guestRemove,
      guestSetQuantity,
      guestIncrement,
      guestDecrement,
      guestClear,
      guestReplaceLines,
      guestBump,
      serverCart,
      addMutation,
      updateMutation,
      removeMutation,
      applyDiscountMutation,
      removeDiscountMutation,
      clearServerMutation,
    ],
  );
}

export interface FreeShippingProgress {
  thresholdCents: number;
  subtotalCents: number;
  remainingCents: number;
  progress: number;
  qualifies: boolean;
}

export function useFreeShippingProgress(): FreeShippingProgress {
  const subtotalCents = useCartSubtotalCents();
  const totals = useCartTotals();
  const fallbackThreshold = useFreeShippingThresholdCents();
  const thresholdCents =
    totals?.freeShippingThresholdCents ?? fallbackThreshold;
  const remainingCents =
    totals?.freeShippingRemainingCents ??
    Math.max(0, thresholdCents - subtotalCents);
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

export function useCartIsServerMode(): boolean {
  return useCartMode() === 'server';
}

/** Expose guest lines for merge-on-login (CartMergeProvider). */
export function useGuestCartLines(): CartLine[] {
  return useCartStore((state) => state.lines);
}

export function useGuestCartClear(): () => void {
  return useCartStore((state) => state.clear);
}
