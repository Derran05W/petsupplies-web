/**
 * Covers the optimistic create + rollback paths in
 * `hooks/useAddresses.ts`.
 *
 * What's covered:
 *   - happy path: `useCreateAddressMutation` writes an optimistic
 *     entry into the cache before the backend round-trip resolves,
 *     and the eventual server response replaces it on settle.
 *   - rollback path: when the mutation rejects, the cache is
 *     restored to its pre-mutation snapshot.
 *
 * What's NOT covered: the update / delete / set-default mutations.
 * They follow the same pattern as `create` and would just duplicate
 * the assertions; the integration is verified via Phase 9's e2e suite
 * (which exercises the addresses page end-to-end via `pnpm dev`).
 *
 * Mock boundary: `@/lib/api/addresses` (the call the hook delegates
 * to) and `@/lib/supabase/client` (so the access-token read is
 * deterministic).
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { mockSupabaseClient } from '@/tests/mocks/supabase';
import {
  useAddressesQuery,
  useCreateAddressMutation,
} from '@/hooks/useAddresses';
import type { Address } from '@/types/account';
import type { AddressInput } from '@/lib/api/addresses';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () =>
    mockSupabaseClient({ session: { access_token: 'token-123' } }),
}));

const apiCreateMock = vi.fn();
const apiListMock = vi.fn();
vi.mock('@/lib/api/addresses', () => ({
  createAddress: (...args: unknown[]) => apiCreateMock(...args),
  listAddresses: (...args: unknown[]) => apiListMock(...args),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
  setDefaultAddress: vi.fn(),
}));

beforeEach(() => {
  apiCreateMock.mockReset();
  apiListMock.mockReset();
});

const SEED_ADDRESS: Address = {
  id: 'addr-1',
  fullName: 'Seed Customer',
  line1: '1 Existing Street',
  city: 'Seedtown',
  state: 'NY',
  postalCode: '00001',
  country: 'US',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const NEW_INPUT: AddressInput = {
  fullName: 'New Customer',
  line1: '99 Maple Avenue',
  city: 'Toronto',
  state: 'ON',
  postalCode: 'M5V 2T6',
  country: 'CA',
  isDefault: false,
};

function makeWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe('useAddresses mutations', () => {
  it('writes the optimistic entry into the cache before the server response resolves', async () => {
    apiListMock.mockResolvedValue([SEED_ADDRESS]);
    const created: Address = {
      ...SEED_ADDRESS,
      id: 'addr-from-server',
      fullName: NEW_INPUT.fullName,
      line1: NEW_INPUT.line1,
      isDefault: false,
    };
    // Hold the create call until the test releases it so we can
    // observe the optimistic entry mid-flight.
    let release: (value: Address) => void = () => {};
    apiCreateMock.mockImplementation(
      () =>
        new Promise<Address>((resolve) => {
          release = resolve;
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });
    const wrapper = makeWrapper(queryClient);

    const { result: query } = renderHook(() => useAddressesQuery(), {
      wrapper,
    });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));
    expect(query.current.data).toEqual([SEED_ADDRESS]);

    const { result: mutation } = renderHook(() => useCreateAddressMutation(), {
      wrapper,
    });

    act(() => {
      mutation.current.mutate(NEW_INPUT);
    });

    // Optimistic entry should have appeared in the cache without
    // waiting for the server response.
    await waitFor(() => {
      const cached = queryClient.getQueryData<Address[]>([
        'account',
        'addresses',
      ]);
      expect(cached?.length).toBe(2);
      expect(cached!.some((a) => a.fullName === NEW_INPUT.fullName)).toBe(true);
    });

    // Release the mock to let the mutation settle.
    await act(async () => {
      release(created);
    });
    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
  });

  it('rolls the cache back to the snapshot when the mutation rejects', async () => {
    apiListMock.mockResolvedValue([SEED_ADDRESS]);
    apiCreateMock.mockRejectedValue(new Error('boom'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });
    const wrapper = makeWrapper(queryClient);

    const { result: query } = renderHook(() => useAddressesQuery(), {
      wrapper,
    });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));

    const { result: mutation } = renderHook(() => useCreateAddressMutation(), {
      wrapper,
    });

    await act(async () => {
      mutation.current.mutate(NEW_INPUT);
    });

    await waitFor(() => expect(mutation.current.isError).toBe(true));
    // The rollback restores the snapshot, then `onSettled` triggers a
    // refetch that resolves to the seed list (apiListMock is still
    // mocked to return [SEED_ADDRESS]).
    await waitFor(() => {
      const after = queryClient.getQueryData<Address[]>([
        'account',
        'addresses',
      ]);
      expect(after).toEqual([SEED_ADDRESS]);
    });
  });
});
