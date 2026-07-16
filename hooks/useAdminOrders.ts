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
  adminGetOrder,
  adminUpdateOrder,
  patchOrderTracking,
} from '@/lib/api/admin/orders';
import type {
  AdminOrderListResponse,
  AdminOrderSummary,
  AdminOrderTrackingInput,
  AdminOrderTrackingResult,
  AdminOrderUpdateInput,
} from '@/types/admin';
import type { AdminFulfillmentQueueResponse } from '@/types/admin-fulfillment';

const ADMIN_ORDERS_ROOT = ['admin', 'orders'] as const;
const ADMIN_FULFILLMENT_ROOT = ['admin', 'fulfillment'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

/**
 * Fetch a single admin order's full detail (`GET /admin/orders/:id`) — the
 * list rows carry no `ship*` columns, so the detail drawer loads this to
 * render the shipping address. Keyed `['admin','orders','detail', id]` so the
 * status/tracking mutations keep it fresh via `setQueryData`.
 */
export function useAdminOrderQuery(
  id: string | null,
): UseQueryResult<AdminOrderSummary, Error> {
  return useQuery({
    queryKey: [...ADMIN_ORDERS_ROOT, 'detail', id] as const,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminGetOrder(id as string, accessToken ? { accessToken } : {});
    },
    enabled: id !== null,
    staleTime: 15_000,
  });
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
        const next: AdminOrderSummary = { ...order, status: input.status };
        if (input.trackingNumber) next.trackingNumber = input.trackingNumber;
        if (input.carrier) next.carrier = input.carrier;
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
      void queryClient.invalidateQueries({ queryKey: ADMIN_FULFILLMENT_ROOT });
    },
  });
}

const patchTrackingFields = (
  order: AdminOrderSummary,
  id: string,
  input: AdminOrderTrackingInput,
): AdminOrderSummary => {
  if (order.id !== id) return order;
  const next: AdminOrderSummary = { ...order };
  if (input.trackingNumber !== undefined) {
    if (input.trackingNumber === null || input.trackingNumber.length === 0) {
      delete next.trackingNumber;
    } else {
      next.trackingNumber = input.trackingNumber;
    }
  }
  if (input.carrier !== undefined) {
    if (input.carrier === null || input.carrier.length === 0) {
      delete next.carrier;
    } else {
      next.carrier = input.carrier;
    }
  }
  // `trackingUrl` is an app-only field (no backend column); patch it locally.
  if (input.trackingUrl !== undefined) {
    if (input.trackingUrl === null || input.trackingUrl.length === 0) {
      delete next.trackingUrl;
    } else {
      next.trackingUrl = input.trackingUrl;
    }
  }
  return next;
};

/** Merge the partial tracking-PATCH result onto a cached row (id match). */
const mergeTrackingResult = (
  order: AdminOrderSummary,
  result: AdminOrderTrackingResult,
): AdminOrderSummary => {
  if (order.id !== result.id) return order;
  const next: AdminOrderSummary = { ...order, status: result.status };
  if (result.trackingNumber) next.trackingNumber = result.trackingNumber;
  else delete next.trackingNumber;
  if (result.carrier) next.carrier = result.carrier;
  else delete next.carrier;
  return next;
};

/**
 * PATCH /admin/orders/:id/tracking — optimistic updates match
 * useUpdateAdminOrderMutation but only tracking fields.
 */
export function useUpdateOrderTrackingMutation(): UseMutationResult<
  AdminOrderTrackingResult,
  Error,
  { id: string; input: AdminOrderTrackingInput },
  {
    listSnapshots: Array<{
      key: readonly unknown[];
      data: AdminOrderListResponse | undefined;
    }>;
    detail: AdminOrderSummary | undefined;
    fqSnapshots: Array<{
      key: readonly unknown[];
      data: AdminFulfillmentQueueResponse | undefined;
    }>;
  }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }) => {
      const accessToken = await getBrowserAccessToken();
      return patchOrderTracking(id, input, accessToken ? { accessToken } : {});
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_ORDERS_ROOT });
      await queryClient.cancelQueries({ queryKey: ADMIN_FULFILLMENT_ROOT });

      const detailKey = [...ADMIN_ORDERS_ROOT, 'detail', id] as const;
      const detail = queryClient.getQueryData<AdminOrderSummary>(detailKey);

      const listEntries = queryClient.getQueriesData<AdminOrderListResponse>({
        queryKey: [...ADMIN_ORDERS_ROOT, 'list'],
      });
      const listSnapshots = listEntries.map(([key, data]) => ({
        key,
        data,
      }));

      const fqEntries =
        queryClient.getQueriesData<AdminFulfillmentQueueResponse>({
          queryKey: [...ADMIN_FULFILLMENT_ROOT, 'queue'],
        });
      const fqSnapshots = fqEntries.map(([key, data]) => ({ key, data }));

      const patch = (order: AdminOrderSummary): AdminOrderSummary =>
        patchTrackingFields(order, id, input);

      for (const [key, data] of listEntries) {
        if (!data) continue;
        queryClient.setQueryData<AdminOrderListResponse>(key, {
          ...data,
          orders: data.orders.map(patch),
        });
      }

      for (const [key, data] of fqEntries) {
        if (!data) continue;
        queryClient.setQueryData(key, {
          ...data,
          orders: data.orders.map(patch),
        });
      }

      if (detail) {
        queryClient.setQueryData<AdminOrderSummary>(detailKey, patch(detail));
      }

      return { listSnapshots, detail, fqSnapshots };
    },
    onError: (_err, variables, context) => {
      if (!context) return;
      for (const snap of context.listSnapshots) {
        queryClient.setQueryData(snap.key, snap.data);
      }
      for (const snap of context.fqSnapshots) {
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
    onSuccess: (result) => {
      // The endpoint echoes only { id, status, trackingNumber, carrier }, so
      // MERGE those columns onto the cached rows rather than replacing them
      // (a replace would drop totals / line items / address).
      const detailKey = [...ADMIN_ORDERS_ROOT, 'detail', result.id] as const;
      const detail = queryClient.getQueryData<AdminOrderSummary>(detailKey);
      if (detail) {
        queryClient.setQueryData(
          detailKey,
          mergeTrackingResult(detail, result),
        );
      }
      const listEntries = queryClient.getQueriesData<AdminOrderListResponse>({
        queryKey: [...ADMIN_ORDERS_ROOT, 'list'],
      });
      for (const [key, data] of listEntries) {
        if (!data) continue;
        queryClient.setQueryData<AdminOrderListResponse>(key, {
          ...data,
          orders: data.orders.map((order) =>
            mergeTrackingResult(order, result),
          ),
        });
      }
      const fqEntries =
        queryClient.getQueriesData<AdminFulfillmentQueueResponse>({
          queryKey: [...ADMIN_FULFILLMENT_ROOT, 'queue'],
        });
      for (const [key, data] of fqEntries) {
        if (!data) continue;
        queryClient.setQueryData(key, {
          ...data,
          orders: data.orders.map((order) =>
            mergeTrackingResult(order, result),
          ),
        });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_ROOT });
      void queryClient.invalidateQueries({ queryKey: ADMIN_FULFILLMENT_ROOT });
    },
  });
}
