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
  cancelSubscription,
  createSubscriptionCheckout,
  listSubscriptions,
  pauseSubscription,
  resumeSubscription,
  updateSubscription,
} from '@/lib/api/subscriptions';
import type {
  CreateSubscriptionCheckoutRequest,
  CreateSubscriptionCheckoutResponse,
  Subscription,
  UpdateSubscriptionRequest,
} from '@/types/subscription';

export const SUBSCRIPTIONS_QUERY_KEY = ['account', 'subscriptions'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export interface UseSubscriptionsQueryOptions {
  /** When false, query is disabled (guest PLP chrome). Defaults true on account surfaces. */
  enabled?: boolean;
}

export function useSubscriptionsQuery(
  options?: UseSubscriptionsQueryOptions,
): UseQueryResult<Subscription[], Error> {
  const enabled = options?.enabled !== false;
  return useQuery({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return listSubscriptions(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
    enabled,
  });
}

export function useCreateSubscriptionCheckoutMutation(): UseMutationResult<
  CreateSubscriptionCheckoutResponse,
  Error,
  CreateSubscriptionCheckoutRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateSubscriptionCheckoutRequest) => {
      const accessToken = await getBrowserAccessToken();
      return createSubscriptionCheckout(
        body,
        accessToken ? { accessToken } : {},
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    },
  });
}

export function usePauseSubscriptionMutation(): UseMutationResult<
  Subscription,
  Error,
  string,
  { previous: Subscription[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const accessToken = await getBrowserAccessToken();
      return pauseSubscription(id, accessToken ? { accessToken } : {});
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Subscription[]>(
        SUBSCRIPTIONS_QUERY_KEY,
      );
      if (!previous) return { previous };
      const next = previous.map((s) =>
        s.id === id ? { ...s, status: 'paused' as const } : s,
      );
      queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, next);
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(SUBSCRIPTIONS_QUERY_KEY, ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    },
  });
}

export function useResumeSubscriptionMutation(): UseMutationResult<
  Subscription,
  Error,
  string,
  { previous: Subscription[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const accessToken = await getBrowserAccessToken();
      return resumeSubscription(id, accessToken ? { accessToken } : {});
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Subscription[]>(
        SUBSCRIPTIONS_QUERY_KEY,
      );
      if (!previous) return { previous };
      const next = previous.map((s) =>
        s.id === id ? { ...s, status: 'active' as const } : s,
      );
      queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, next);
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(SUBSCRIPTIONS_QUERY_KEY, ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    },
  });
}

export function useCancelSubscriptionMutation(): UseMutationResult<
  Subscription | undefined,
  Error,
  string,
  { previous: Subscription[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const accessToken = await getBrowserAccessToken();
      return cancelSubscription(id, accessToken ? { accessToken } : {});
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Subscription[]>(
        SUBSCRIPTIONS_QUERY_KEY,
      );
      if (!previous) return { previous };
      const next = previous.map((s) =>
        s.id === id
          ? {
              ...s,
              cancelAtPeriodEnd: true,
            }
          : s,
      );
      queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, next);
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(SUBSCRIPTIONS_QUERY_KEY, ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    },
  });
}

export function useUpdateSubscriptionMutation(): UseMutationResult<
  Subscription,
  Error,
  { id: string; patch: UpdateSubscriptionRequest },
  { previous: Subscription[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }) => {
      const accessToken = await getBrowserAccessToken();
      return updateSubscription(id, patch, accessToken ? { accessToken } : {});
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Subscription[]>(
        SUBSCRIPTIONS_QUERY_KEY,
      );
      if (!previous) return { previous };
      const next = previous.map((s) =>
        s.id === id
          ? {
              ...s,
              ...(patch.quantity !== undefined
                ? { quantity: patch.quantity }
                : {}),
              ...(patch.interval !== undefined
                ? { interval: patch.interval }
                : {}),
              ...(patch.petId !== undefined ? { petId: patch.petId } : {}),
            }
          : s,
      );
      queryClient.setQueryData<Subscription[]>(SUBSCRIPTIONS_QUERY_KEY, next);
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(SUBSCRIPTIONS_QUERY_KEY, ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    },
  });
}
