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
  adminBulkShip,
  adminFulfillmentQueue,
} from '@/lib/api/admin/fulfillment';
import type {
  AdminBulkShipRequest,
  AdminBulkShipResponse,
  AdminBulkShipResult,
  AdminFulfillmentQueueResponse,
} from '@/types/admin-fulfillment';
import type { OrderStatus } from '@/types/order';
import type { AdminOrderListResponse, AdminOrderSummary } from '@/types/admin';

const ADMIN_FULFILLMENT_ROOT = ['admin', 'fulfillment'] as const;
const ADMIN_ORDERS_ROOT = ['admin', 'orders'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export interface FulfillmentQueueKey {
  page: number;
  status?: OrderStatus;
}

function queueKey(args: FulfillmentQueueKey) {
  return [...ADMIN_FULFILLMENT_ROOT, 'queue', args] as const;
}

export function useAdminFulfillmentQueueQuery(
  args: FulfillmentQueueKey,
): UseQueryResult<AdminFulfillmentQueueResponse, Error> {
  return useQuery({
    queryKey: queueKey(args),
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminFulfillmentQueue({
        page: args.page,
        ...(args.status ? { status: args.status } : {}),
        ...(accessToken ? { accessToken } : {}),
      });
    },
    staleTime: 15_000,
  });
}

export function useAdminBulkShipMutation(): UseMutationResult<
  AdminBulkShipResponse,
  Error,
  AdminBulkShipRequest,
  undefined
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const accessToken = await getBrowserAccessToken();
      return adminBulkShip(body, accessToken ? { accessToken } : {});
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_FULFILLMENT_ROOT });
      void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_ROOT });
    },
  });
}

/**
 * Patch orders in every cached admin orders list + fulfillment queue after a
 * bulk ship. The backend only echoes `{ id, status }` per shipped order, so we
 * merge the new status onto the cached row (a full refetch reconciles the
 * rest via the mutation's `onSettled` invalidation).
 */
export function mergeUpdatedOrdersIntoCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: AdminBulkShipResult[],
): void {
  if (updated.length === 0) return;
  const byId = new Map(updated.map((o) => [o.id, o]));
  const patchOrder = (o: AdminOrderSummary): AdminOrderSummary => {
    const next = byId.get(o.id);
    return next ? { ...o, status: next.status } : o;
  };

  const listEntries = queryClient.getQueriesData<AdminOrderListResponse>({
    queryKey: [...ADMIN_ORDERS_ROOT, 'list'],
  });
  for (const [key, data] of listEntries) {
    if (!data) continue;
    queryClient.setQueryData<AdminOrderListResponse>(key, {
      ...data,
      orders: data.orders.map(patchOrder),
    });
  }

  const fqEntries = queryClient.getQueriesData<AdminFulfillmentQueueResponse>({
    queryKey: [...ADMIN_FULFILLMENT_ROOT, 'queue'],
  });
  for (const [key, data] of fqEntries) {
    if (!data) continue;
    queryClient.setQueryData<AdminFulfillmentQueueResponse>(key, {
      ...data,
      orders: data.orders.map(patchOrder),
    });
  }
}
