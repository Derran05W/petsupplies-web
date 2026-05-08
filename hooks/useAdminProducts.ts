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
  adminCreateProduct,
  adminDeleteProduct,
  adminGetProduct,
  adminListProducts,
  adminUpdateProduct,
  type AdminProductListOptions,
} from '@/lib/api/admin/products';
import type {
  AdminProduct,
  AdminProductInput,
  AdminProductListResponse,
  StockState,
} from '@/types/admin';

const ADMIN_PRODUCTS_ROOT = ['admin', 'products'] as const;

interface ListKeyArgs {
  page: number;
  search: string;
  stockState: StockState;
}

function listQueryKey(args: ListKeyArgs) {
  return [...ADMIN_PRODUCTS_ROOT, 'list', args] as const;
}

function detailQueryKey(id: string) {
  return [...ADMIN_PRODUCTS_ROOT, 'detail', id] as const;
}

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

export function useAdminProductsQuery(
  args: ListKeyArgs,
): UseQueryResult<AdminProductListResponse, Error> {
  return useQuery({
    queryKey: listQueryKey(args),
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      const opts: AdminProductListOptions = {
        page: args.page,
        ...(args.search.length > 0 ? { search: args.search } : {}),
        ...(args.stockState !== 'all' ? { stockState: args.stockState } : {}),
        ...(accessToken ? { accessToken } : {}),
      };
      return adminListProducts(opts);
    },
    staleTime: 30_000,
  });
}

export function useAdminProductDetailQuery(
  id: string | null,
): UseQueryResult<AdminProduct | null, Error> {
  return useQuery({
    queryKey: detailQueryKey(id ?? '__none__'),
    enabled: id !== null,
    queryFn: async () => {
      if (!id) return null;
      const accessToken = await getBrowserAccessToken();
      return adminGetProduct(id, accessToken ? { accessToken } : {});
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

export function useCreateAdminProductMutation(): UseMutationResult<
  AdminProduct,
  Error,
  AdminProductInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      const accessToken = await getBrowserAccessToken();
      return adminCreateProduct(input, accessToken ? { accessToken } : {});
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_ROOT });
    },
  });
}

export function useUpdateAdminProductMutation(): UseMutationResult<
  AdminProduct,
  Error,
  { id: string; input: AdminProductInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }) => {
      const accessToken = await getBrowserAccessToken();
      return adminUpdateProduct(id, input, accessToken ? { accessToken } : {});
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(detailQueryKey(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_ROOT });
    },
  });
}

export function useDeleteAdminProductMutation(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const accessToken = await getBrowserAccessToken();
      await adminDeleteProduct(id, accessToken ? { accessToken } : {});
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_ROOT });
    },
  });
}
