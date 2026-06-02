'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { addCartItem } from '@/lib/api/cart';
import { CART_QUERY_KEY } from '@/lib/cart/query-key';
import { getBrowserAccessToken } from '@/lib/supabase/browser-access-token';
import { useCartStore } from '@/lib/store/cart';
import { useAuth } from '@/hooks/useAuth';

/**
 * On sign-in, merge local Zustand cart lines into the server cart, then
 * clear local storage and invalidate the server cart query.
 */
export function CartMergeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const previousUserIdRef = useRef<string | null>(null);
  const mergingRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    const previousUserId = previousUserIdRef.current;
    const currentUserId = user?.id ?? null;
    previousUserIdRef.current = currentUserId;

    if (
      !currentUserId ||
      previousUserId === currentUserId ||
      mergingRef.current
    ) {
      return;
    }

    const localLines = useCartStore.getState().lines;
    if (localLines.length === 0) {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      return;
    }

    mergingRef.current = true;

    void (async () => {
      try {
        const accessToken = await getBrowserAccessToken();
        if (!accessToken) return;

        for (const line of localLines) {
          try {
            await addCartItem(line.productId, line.quantity, { accessToken });
          } catch {
            // Ignore insufficient stock / inactive product during merge.
          }
        }

        useCartStore.getState().clear();
        await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      } finally {
        mergingRef.current = false;
      }
    })();
  }, [user?.id, loading, queryClient]);

  return children;
}
