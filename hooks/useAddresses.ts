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
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
  type AddressInput,
} from '@/lib/api/addresses';
import type { Address, AddressId } from '@/types/account';

const ADDRESSES_QUERY_KEY = ['account', 'addresses'] as const;

/**
 * Read the current Supabase access token from the browser client. Read
 * fresh on every mutation so a token refresh between mount and submit
 * uses the new value. Returns `undefined` when signed out (the calling
 * mutation will surface a 401-style error in the form summary).
 */
async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useAddressesQuery(): UseQueryResult<Address[], Error> {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return listAddresses(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
  });
}

/**
 * Mutation set with optimistic updates. Each mutation:
 *   1. Cancels in-flight refetches against the addresses key.
 *   2. Snapshots the current cache.
 *   3. Optimistically writes the expected next state.
 *   4. On error, rolls back to the snapshot and surfaces `error`.
 *   5. On settled, invalidates the cache so the eventual server state
 *      becomes the source of truth.
 *
 * Server actions were considered and rejected: each `revalidatePath`
 * forces a full RSC re-render, which is slower and noisier than the
 * cache surgery here, and the optimistic-update pattern is what
 * Phase 14 / 16 / 17+ surfaces will need anyway.
 */
export function useCreateAddressMutation(): UseMutationResult<
  Address,
  Error,
  AddressInput,
  { previous: Address[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddressInput) => {
      const accessToken = await getBrowserAccessToken();
      return createAddress(input, accessToken ? { accessToken } : {});
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ADDRESSES_QUERY_KEY });
      const previous = queryClient.getQueryData<Address[]>(ADDRESSES_QUERY_KEY);
      const optimistic: Address = {
        id: `temp_${Date.now()}`,
        fullName: input.fullName,
        line1: input.line1,
        ...(input.line2 && input.line2.length > 0
          ? { line2: input.line2 }
          : {}),
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        isDefault:
          input.isDefault === true || !previous || previous.length === 0,
        createdAt: new Date().toISOString(),
      };
      const next = optimistic.isDefault
        ? [
            ...(previous?.map((a) => ({ ...a, isDefault: false })) ?? []),
            optimistic,
          ]
        : [...(previous ?? []), optimistic];
      queryClient.setQueryData<Address[]>(ADDRESSES_QUERY_KEY, next);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADDRESSES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useUpdateAddressMutation(): UseMutationResult<
  Address,
  Error,
  { id: AddressId; input: AddressInput },
  { previous: Address[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }) => {
      const accessToken = await getBrowserAccessToken();
      return updateAddress(id, input, accessToken ? { accessToken } : {});
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ADDRESSES_QUERY_KEY });
      const previous = queryClient.getQueryData<Address[]>(ADDRESSES_QUERY_KEY);
      if (!previous) return { previous };
      const willBeDefault = input.isDefault === true;
      const next = previous.map((addr) => {
        if (addr.id === id) {
          return {
            ...addr,
            fullName: input.fullName,
            line1: input.line1,
            ...(input.line2 && input.line2.length > 0
              ? { line2: input.line2 }
              : { line2: undefined }),
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
            isDefault: willBeDefault || addr.isDefault,
          };
        }
        if (willBeDefault) return { ...addr, isDefault: false };
        return addr;
      });
      queryClient.setQueryData<Address[]>(ADDRESSES_QUERY_KEY, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADDRESSES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useDeleteAddressMutation(): UseMutationResult<
  void,
  Error,
  AddressId,
  { previous: Address[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: AddressId) => {
      const accessToken = await getBrowserAccessToken();
      await deleteAddress(id, accessToken ? { accessToken } : {});
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ADDRESSES_QUERY_KEY });
      const previous = queryClient.getQueryData<Address[]>(ADDRESSES_QUERY_KEY);
      if (!previous) return { previous };
      const removed = previous.find((addr) => addr.id === id);
      const remaining = previous.filter((addr) => addr.id !== id);
      // If we removed the current default, optimistically promote the
      // most recent remaining entry — matches the lib/api fallback so
      // the optimistic UI agrees with the eventual server state.
      if (removed?.isDefault && remaining.length > 0) {
        const sorted = [...remaining].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const promoted = sorted[0];
        if (promoted) {
          const promotedId = promoted.id;
          const next = remaining.map((addr) =>
            addr.id === promotedId
              ? { ...addr, isDefault: true }
              : { ...addr, isDefault: false },
          );
          queryClient.setQueryData<Address[]>(ADDRESSES_QUERY_KEY, next);
        }
      } else {
        queryClient.setQueryData<Address[]>(ADDRESSES_QUERY_KEY, remaining);
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADDRESSES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useSetDefaultAddressMutation(): UseMutationResult<
  Address,
  Error,
  AddressId,
  { previous: Address[] | undefined }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: AddressId) => {
      const accessToken = await getBrowserAccessToken();
      return setDefaultAddress(id, accessToken ? { accessToken } : {});
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ADDRESSES_QUERY_KEY });
      const previous = queryClient.getQueryData<Address[]>(ADDRESSES_QUERY_KEY);
      if (!previous) return { previous };
      const next = previous.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      queryClient.setQueryData<Address[]>(ADDRESSES_QUERY_KEY, next);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADDRESSES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
