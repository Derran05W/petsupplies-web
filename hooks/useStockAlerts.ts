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
  createStockAlert,
  deleteStockAlert,
  listStockAlerts,
} from '@/lib/api/stockAlerts';
import type { StockAlert } from '@/types/stock-alert';
import type { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { STOCK_ALERTS_QUERY_KEY } from '@/lib/stock-alerts/query-key';

export { STOCK_ALERTS_QUERY_KEY };

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

function stockAlertsRootQueryOptions(enabled: boolean) {
  return {
    queryKey: STOCK_ALERTS_QUERY_KEY,
    queryFn: async (): Promise<StockAlert[]> => {
      const accessToken = await getBrowserAccessToken();
      return listStockAlerts(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
    enabled,
  };
}

export function useStockAlertsQuery(options?: {
  enabled?: boolean;
}): UseQueryResult<StockAlert[], Error> {
  const { user, loading } = useAuth();
  const enabled =
    options?.enabled !== undefined
      ? options.enabled
      : !loading && Boolean(user);

  return useQuery({
    ...stockAlertsRootQueryOptions(enabled),
  });
}

/** True when the signed-in customer has an active alert for this product id. */
export function useIsStockAlertedFor(productId: string): boolean {
  const { user, loading } = useAuth();
  const enabled = !loading && Boolean(user);
  const { data } = useQuery({
    ...stockAlertsRootQueryOptions(enabled),
    select: (items) => items.some((a) => a.productId === productId),
  });
  return data ?? false;
}

export function useCreateStockAlertMutation(): UseMutationResult<
  StockAlert,
  Error,
  { productId: string; product: Product },
  { previous: StockAlert[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, product }) => {
      const accessToken = await getBrowserAccessToken();
      return createStockAlert(productId, {
        ...(accessToken ? { accessToken } : {}),
        product,
      });
    },
    onMutate: async ({ productId, product }) => {
      await queryClient.cancelQueries({ queryKey: STOCK_ALERTS_QUERY_KEY });
      const previous = queryClient.getQueryData<StockAlert[]>(
        STOCK_ALERTS_QUERY_KEY,
      );
      const optimistic: StockAlert = {
        productId,
        product,
        createdAt: new Date().toISOString(),
      };
      const withoutDup = (previous ?? []).filter(
        (a) => a.productId !== productId,
      );
      queryClient.setQueryData<StockAlert[]>(STOCK_ALERTS_QUERY_KEY, [
        ...withoutDup,
        optimistic,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(STOCK_ALERTS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_QUERY_KEY });
    },
  });
}

export function useDeleteStockAlertMutation(): UseMutationResult<
  void,
  Error,
  string,
  { previous: StockAlert[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const accessToken = await getBrowserAccessToken();
      await deleteStockAlert(productId, accessToken ? { accessToken } : {});
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: STOCK_ALERTS_QUERY_KEY });
      const previous = queryClient.getQueryData<StockAlert[]>(
        STOCK_ALERTS_QUERY_KEY,
      );
      const next = (previous ?? []).filter((a) => a.productId !== productId);
      queryClient.setQueryData(STOCK_ALERTS_QUERY_KEY, next);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(STOCK_ALERTS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: STOCK_ALERTS_QUERY_KEY });
    },
  });
}
