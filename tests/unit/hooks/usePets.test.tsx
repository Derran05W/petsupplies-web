/**
 * Matches `useAddresses.test.tsx`: optimistic pet create writes into the cache
 * and rolls back on rejection.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { mockSupabaseClient } from '@/tests/mocks/supabase';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { Pet } from '@/types/pet';
import { useCreatePetMutation, usePetsQuery } from '@/hooks/usePets';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () =>
    mockSupabaseClient({ session: { access_token: 'token-123' } }),
}));

const apiCreateMock = vi.fn();
const apiListMock = vi.fn();
vi.mock('@/lib/api/pets', () => ({
  createPet: (...args: unknown[]) => apiCreateMock(...args),
  listPets: (...args: unknown[]) => apiListMock(...args),
  updatePet: vi.fn(),
  deletePet: vi.fn(),
  getPet: vi.fn(),
  isPetCapacityApiError: vi.fn(),
}));

beforeEach(() => {
  apiCreateMock.mockReset();
  apiListMock.mockReset();
});

function makeWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

const SEED: Pet = {
  id: 'p1',
  name: 'Ada',
  species: 'dog',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('usePets mutations', () => {
  it('writes an optimistic pet into the cache before the server resolves', async () => {
    apiListMock.mockResolvedValue([SEED]);
    const created: Pet = {
      ...SEED,
      id: 'p-server',
      name: 'Nova',
      species: 'cat',
    };
    let release: (value: Pet) => void = () => {};
    apiCreateMock.mockImplementation(
      () =>
        new Promise<Pet>((resolve) => {
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

    const { result: query } = renderHook(() => usePetsQuery(), { wrapper });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));
    expect(query.current.data).toEqual([SEED]);

    const { result: mutation } = renderHook(() => useCreatePetMutation(), {
      wrapper,
    });

    act(() => {
      mutation.current.mutate({
        name: 'Nova',
        species: 'cat',
      });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<Pet[]>(['account', 'pets']);
      expect(cached?.some((p) => p.name === 'Nova')).toBe(true);
    });

    await act(async () => {
      release(created);
    });
    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
  });

  it('rolls the cache back when create rejects', async () => {
    apiListMock.mockResolvedValue([SEED]);
    apiCreateMock.mockRejectedValue(new Error('boom'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });
    const wrapper = makeWrapper(queryClient);

    const { result: query } = renderHook(() => usePetsQuery(), { wrapper });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));

    const { result: mutation } = renderHook(() => useCreatePetMutation(), {
      wrapper,
    });

    await act(async () => {
      try {
        await mutation.current.mutateAsync({
          name: 'Bad',
          species: 'bird',
        });
      } catch {
        // expected
      }
    });

    expect(queryClient.getQueryData(['account', 'pets'])).toEqual([SEED]);
  });
});
