'use client';

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { adminUpdateOrder } from '@/lib/api/admin/orders';
import type {
  AdminOrderListResponse,
  AdminOrderSummary,
  AdminOrderUpdateInput,
} from '@/types/admin';

const ADMIN_ORDERS_ROOT = ['admin', 'orders'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

/**
 * Update an admin order. Optimistically writes the updated row across
 * EVERY cached `['admin', 'orders', ...]` list query (search/page tuple
 * keys vary, so we walk the cache rather than guessing the active key)
 * AND the per-order detail entry. On error we restore both snapshots.
 */
export function useUpdateAdminOrderMutation(): UseMutationResult<
  AdminOrderSummary,
  Error,
  { id: string; input: AdminOrderUpdateInput },
  {
    listSnapshots: Array<{
      key: readonly unknown[];
      data: AdminOrderListResponse | undefined;
    }>;
    detail: AdminOrderSummary | undefined;
  }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }) => {
      const accessToken = await getBrowserAccessToken();
      return adminUpdateOrder(id, input, accessToken ? { accessToken } : {});
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_ORDERS_ROOT });

      const detailKey = [...ADMIN_ORDERS_ROOT, 'detail', id] as const;
      const detail = queryClient.getQueryData<AdminOrderSummary>(detailKey);

      const listEntries = queryClient.getQueriesData<AdminOrderListResponse>({
        queryKey: [...ADMIN_ORDERS_ROOT, 'list'],
      });

      const listSnapshots = listEntries.map(([key, data]) => ({
        key,
        data,
      }));

      const patch = (order: AdminOrderSummary): AdminOrderSummary => {
        if (order.id !== id) return order;
        const next: AdminOrderSummary = { ...order };
        if (input.status !== undefined) next.status = input.status;
        if (input.trackingNumber !== undefined) {
          if (
            input.trackingNumber === null ||
            input.trackingNumber.length === 0
          ) {
            delete next.trackingNumber;
          } else {
            next.trackingNumber = input.trackingNumber;
          }
        }
        if (input.trackingUrl !== undefined) {
          if (input.trackingUrl === null || input.trackingUrl.length === 0) {
            delete next.trackingUrl;
          } else {
            next.trackingUrl = input.trackingUrl;
          }
        }
        return next;
      };

      for (const [key, data] of listEntries) {
        if (!data) continue;
        const optimistic: AdminOrderListResponse = {
          ...data,
          orders: data.orders.map(patch),
        };
        queryClient.setQueryData<AdminOrderListResponse>(key, optimistic);
      }

      if (detail) {
        queryClient.setQueryData<AdminOrderSummary>(detailKey, patch(detail));
      }

      return { listSnapshots, detail };
    },
    onError: (_err, variables, context) => {
      if (!context) return;
      for (const snap of context.listSnapshots) {
        queryClient.setQueryData(snap.key, snap.data);
      }
      if (context.detail) {
        const detailKey = [
          ...ADMIN_ORDERS_ROOT,
          'detail',
          variables.id,
        ] as const;
        queryClient.setQueryData(detailKey, context.detail);
      }
    },
    onSuccess: (updated) => {
      const detailKey = [...ADMIN_ORDERS_ROOT, 'detail', updated.id] as const;
      queryClient.setQueryData(detailKey, updated);
      const listEntries = queryClient.getQueriesData<AdminOrderListResponse>({
        queryKey: [...ADMIN_ORDERS_ROOT, 'list'],
      });
      for (const [key, data] of listEntries) {
        if (!data) continue;
        queryClient.setQueryData<AdminOrderListResponse>(key, {
          ...data,
          orders: data.orders.map((order) =>
            order.id === updated.id ? updated : order,
          ),
        });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_ROOT });
    },
  });
}
