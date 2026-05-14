'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  addWishlistItem,
  listWishlist,
  removeWishlistItem,
} from '@/lib/api/wishlist';
import type { WishlistItem } from '@/types/wishlist';
import type { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { WISHLIST_QUERY_KEY } from '@/lib/wishlist/query-key';

export { WISHLIST_QUERY_KEY };

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

function wishlistRootQueryOptions(enabled: boolean) {
  return {
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async (): Promise<WishlistItem[]> => {
      const accessToken = await getBrowserAccessToken();
      return listWishlist(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
    enabled,
  };
}

/**
 * Wishlist rows for the signed-in customer. When `enabled` is omitted,
 * the query runs only after `useAuth` resolves with a user (skips public PLP
 * until we know the session state). Force `enabled: true` on `/account/*`
 * pages where middleware already guarantees a session.
 */
export function useWishlistQuery(options?: {
  enabled?: boolean;
}): UseQueryResult<WishlistItem[], Error> {
  const { user, loading } = useAuth();
  const enabled =
    options?.enabled !== undefined
      ? options.enabled
      : !loading && Boolean(user);

  return useQuery({
    ...wishlistRootQueryOptions(enabled),
  });
}

/** Narrow subscription — selected wishlisted flag per product card. */
export function useIsWishlisted(productId: string): boolean {
  const { user, loading } = useAuth();
  const enabled = !loading && Boolean(user);
  const { data } = useQuery({
    ...wishlistRootQueryOptions(enabled),
    select: (items) => items.some((i) => i.product.id === productId),
  });
  return data ?? false;
}

export function useAddWishlistMutation(): UseMutationResult<
  WishlistItem,
  Error,
  { productId: string; product: Product },
  { previous: WishlistItem[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, product }) => {
      const accessToken = await getBrowserAccessToken();
      return addWishlistItem(productId, {
        ...(accessToken ? { accessToken } : {}),
        product,
      });
    },
    onMutate: async ({ productId, product }) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      const previous =
        queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY);
      const optimistic: WishlistItem = {
        product,
        addedAt: new Date().toISOString(),
      };
      const withoutDup = (previous ?? []).filter(
        (i) => i.product.id !== productId,
      );
      queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, [
        ...withoutDup,
        optimistic,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}

export function useRemoveWishlistMutation(): UseMutationResult<
  void,
  Error,
  string,
  { previous: WishlistItem[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const accessToken = await getBrowserAccessToken();
      await removeWishlistItem(productId, accessToken ? { accessToken } : {});
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      const previous =
        queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY);
      const next = (previous ?? []).filter((i) => i.product.id !== productId);
      queryClient.setQueryData(WISHLIST_QUERY_KEY, next);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}
