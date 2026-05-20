'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { replaceFeaturedProducts } from '@/lib/api/admin/site-featured';
import { fetchFeaturedProductsForAdmin } from '@/lib/api/site/featured-products';
import type { Product } from '@/types/product';

const FEATURED_ROOT = ['admin', 'site-featured'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useFeaturedProductsQuery(): UseQueryResult<Product[], Error> {
  return useQuery({
    queryKey: FEATURED_ROOT,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return fetchFeaturedProductsForAdmin(accessToken);
    },
    staleTime: 30_000,
  });
}

export function useReplaceFeaturedProductsMutation(): UseMutationResult<
  Product[],
  Error,
  string[]
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productIds) => {
      const accessToken = await getBrowserAccessToken();
      return replaceFeaturedProducts(
        productIds,
        accessToken ? { accessToken } : {},
      );
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(FEATURED_ROOT, updated);
    },
  });
}
