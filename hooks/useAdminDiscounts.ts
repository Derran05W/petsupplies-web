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
  adminCreateDiscount,
  adminDeleteDiscount,
  adminListDiscounts,
  adminUpdateDiscount,
  type AdminDiscountListOptions,
} from '@/lib/api/admin/discounts';
import type {
  AdminDiscount,
  AdminDiscountCreateInput,
  AdminDiscountListResponse,
  AdminDiscountUpdateInput,
} from '@/types/admin-discount';

const ADMIN_DISCOUNTS_ROOT = ['admin', 'discounts'] as const;

interface ListKeyArgs {
  page: number;
  activeFilter: 'all' | 'active' | 'inactive';
}

function listQueryKey(args: ListKeyArgs) {
  return [...ADMIN_DISCOUNTS_ROOT, 'list', args] as const;
}

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useAdminDiscountsQuery(
  args: ListKeyArgs,
): UseQueryResult<AdminDiscountListResponse, Error> {
  return useQuery({
    queryKey: listQueryKey(args),
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      const opts: AdminDiscountListOptions = {
        page: args.page,
        ...(args.activeFilter === 'active' ? { active: true } : {}),
        ...(args.activeFilter === 'inactive' ? { active: false } : {}),
        ...(accessToken ? { accessToken } : {}),
      };
      return adminListDiscounts(opts);
    },
    staleTime: 30_000,
  });
}

export function useCreateDiscountMutation(): UseMutationResult<
  AdminDiscount,
  Error,
  AdminDiscountCreateInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const accessToken = await getBrowserAccessToken();
      return adminCreateDiscount(body, accessToken ? { accessToken } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DISCOUNTS_ROOT });
    },
  });
}

export function useUpdateDiscountMutation(): UseMutationResult<
  AdminDiscount,
  Error,
  { id: string; body: AdminDiscountUpdateInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }) => {
      const accessToken = await getBrowserAccessToken();
      return adminUpdateDiscount(id, body, accessToken ? { accessToken } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DISCOUNTS_ROOT });
    },
  });
}

export function useDeleteDiscountMutation(): UseMutationResult<
  AdminDiscount,
  Error,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const accessToken = await getBrowserAccessToken();
      return adminDeleteDiscount(id, accessToken ? { accessToken } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_DISCOUNTS_ROOT });
    },
  });
}
