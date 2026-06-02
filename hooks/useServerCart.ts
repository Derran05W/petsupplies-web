'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import type { Product } from '@/types/product';
import type { ServerCart } from '@/types/cart';
import {
  addCartItem,
  applyCartDiscount,
  clearServerCart,
  getCart,
  removeCartDiscount,
  removeCartItem,
  updateCartItem,
} from '@/lib/api/cart';
import { mapApiCartItemToViewLine } from '@/lib/cart/map-server-cart';
import { CART_QUERY_KEY } from '@/lib/cart/query-key';
import { stripDiscountFromServerCart } from '@/lib/cart/strip-discount';
import { getBrowserAccessToken } from '@/lib/supabase/browser-access-token';
import { useAuth } from '@/hooks/useAuth';

export { CART_QUERY_KEY };

async function fetchServerCart(): Promise<ServerCart> {
  const accessToken = await getBrowserAccessToken();
  if (!accessToken) {
    throw new Error('Cart requires a signed-in session');
  }
  return getCart({ accessToken });
}

export function useServerCartQuery(options?: {
  enabled?: boolean;
}): UseQueryResult<ServerCart, Error> {
  const { user, loading } = useAuth();
  const enabled =
    options?.enabled !== undefined
      ? options.enabled
      : !loading && Boolean(user);

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchServerCart,
    staleTime: 30_000,
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useAddCartItemMutation(): UseMutationResult<
  ServerCart,
  Error,
  { product: Product; quantity: number },
  { previous: ServerCart | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ product, quantity }) => {
      const accessToken = await getBrowserAccessToken();
      if (!accessToken) throw new Error('Sign in to add to cart');
      await addCartItem(product.id, quantity, { accessToken });
      return fetchServerCart();
    },
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<ServerCart>(CART_QUERY_KEY);
      if (previous) {
        const existing = previous.items.find(
          (item) => item.productId === product.id,
        );
        const nextItems = existing
          ? previous.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [
              {
                id: `optimistic-${product.id}`,
                productId: product.id,
                quantity,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.priceCents,
                  imageUrl: product.images[0]?.url ?? null,
                  stock: product.stockCount,
                  active: product.inStock,
                },
              },
              ...previous.items,
            ];
        queryClient.setQueryData<ServerCart>(CART_QUERY_KEY, {
          ...previous,
          items: nextItems,
          subtotalCents: nextItems.reduce(
            (sum, item) => sum + item.quantity * item.product.price,
            0,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}

export function useUpdateCartItemMutation(): UseMutationResult<
  ServerCart,
  Error,
  { cartItemId: string; quantity: number },
  { previous: ServerCart | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cartItemId, quantity }) => {
      const accessToken = await getBrowserAccessToken();
      if (!accessToken) throw new Error('Sign in to update cart');
      await updateCartItem(cartItemId, quantity, { accessToken });
      return fetchServerCart();
    },
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<ServerCart>(CART_QUERY_KEY);
      if (previous) {
        const nextItems =
          quantity <= 0
            ? previous.items.filter((item) => item.id !== cartItemId)
            : previous.items.map((item) =>
                item.id === cartItemId ? { ...item, quantity } : item,
              );
        queryClient.setQueryData<ServerCart>(CART_QUERY_KEY, {
          ...previous,
          items: nextItems,
          subtotalCents: nextItems.reduce(
            (sum, item) => sum + item.quantity * item.product.price,
            0,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}

export function useRemoveCartItemMutation(): UseMutationResult<
  ServerCart,
  Error,
  string,
  { previous: ServerCart | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cartItemId) => {
      const accessToken = await getBrowserAccessToken();
      if (!accessToken) throw new Error('Sign in to update cart');
      await removeCartItem(cartItemId, { accessToken });
      return fetchServerCart();
    },
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<ServerCart>(CART_QUERY_KEY);
      if (previous) {
        const nextItems = previous.items.filter(
          (item) => item.id !== cartItemId,
        );
        queryClient.setQueryData<ServerCart>(CART_QUERY_KEY, {
          ...previous,
          items: nextItems,
          subtotalCents: nextItems.reduce(
            (sum, item) => sum + item.quantity * item.product.price,
            0,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}

export function useApplyCartDiscountMutation(): UseMutationResult<
  ServerCart,
  Error,
  string,
  { previous: ServerCart | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code) => {
      const accessToken = await getBrowserAccessToken();
      if (!accessToken) throw new Error('Sign in to apply a discount');
      return applyCartDiscount(code, { accessToken });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<ServerCart>(CART_QUERY_KEY);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}

export function useRemoveCartDiscountMutation(): UseMutationResult<
  ServerCart,
  Error,
  void,
  { previous: ServerCart | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const accessToken = await getBrowserAccessToken();
      if (!accessToken) throw new Error('Sign in to remove discount');
      await removeCartDiscount({ accessToken });
      return fetchServerCart();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previous = queryClient.getQueryData<ServerCart>(CART_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<ServerCart>(
          CART_QUERY_KEY,
          stripDiscountFromServerCart(previous),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previous);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}

export function useClearServerCartMutation(): UseMutationResult<
  void,
  Error,
  void
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const accessToken = await getBrowserAccessToken();
      if (!accessToken) return;
      await clearServerCart({ accessToken });
    },
    onSuccess: () => {
      queryClient.setQueryData<ServerCart>(CART_QUERY_KEY, {
        id: '',
        items: [],
        subtotalCents: 0,
        appliedDiscountCents: 0,
        shippingCents: 0,
        shippingDiscountCents: 0,
        totalCents: 0,
        freeShippingThresholdCents: 5000,
        freeShippingRemainingCents: 5000,
      });
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

/** Helper for merge-on-login optimistic rows. */
export function optimisticCartLineFromProduct(
  product: Product,
  quantity: number,
): ReturnType<typeof mapApiCartItemToViewLine> {
  return mapApiCartItemToViewLine({
    id: `optimistic-${product.id}`,
    productId: product.id,
    quantity,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.priceCents,
      imageUrl: product.images[0]?.url ?? null,
      stock: product.stockCount,
      active: product.inStock,
    },
  });
}
