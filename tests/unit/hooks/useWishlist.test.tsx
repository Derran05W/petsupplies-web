/**
 * Optimistic wishlist mutations — mirrors the addresses hook tests.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockSupabaseClient } from '@/tests/mocks/supabase';
import { useAddWishlistMutation, useWishlistQuery } from '@/hooks/useWishlist';
import { oneFeaturedProduct } from '@/tests/fixtures/products';
import { WISHLIST_QUERY_KEY } from '@/lib/wishlist/query-key';
import type { WishlistItem } from '@/types/wishlist';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () =>
    mockSupabaseClient({ session: { access_token: 'token-123' } }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'a@b.co' },
    loading: false,
    signOut: vi.fn(),
  }),
}));

const listMock = vi.fn();
const addMock = vi.fn();
const removeMock = vi.fn();

vi.mock('@/lib/api/wishlist', () => ({
  listWishlist: (...args: unknown[]) => listMock(...args),
  addWishlistItem: (...args: unknown[]) => addMock(...args),
  removeWishlistItem: (...args: unknown[]) => removeMock(...args),
}));

beforeEach(() => {
  listMock.mockReset();
  addMock.mockReset();
  removeMock.mockReset();
});

function makeWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe('useWishlist', () => {
  it('prefetches list then add mutation writes optimistic row before server resolves', async () => {
    const product = oneFeaturedProduct();
    const seed: WishlistItem[] = [];
    const serverItem: WishlistItem = {
      product,
      addedAt: '2026-03-01T00:00:00.000Z',
    };

    listMock.mockResolvedValue(seed);
    let release: (value: WishlistItem) => void = () => {};
    addMock.mockImplementation(
      () =>
        new Promise<WishlistItem>((resolve) => {
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

    const { result: query } = renderHook(() => useWishlistQuery(), {
      wrapper,
    });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));

    const { result: mutation } = renderHook(() => useAddWishlistMutation(), {
      wrapper,
    });

    act(() => {
      mutation.current.mutate({ productId: product.id, product });
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY),
      ).toMatchObject([{ product }]),
    );

    await act(async () => {
      release(serverItem);
    });

    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
  });

  it('rolls back optimistic add when the API rejects', async () => {
    const product = oneFeaturedProduct();
    listMock.mockResolvedValue([]);
    addMock.mockRejectedValue(new Error('boom'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });
    const wrapper = makeWrapper(queryClient);

    const { result: query } = renderHook(() => useWishlistQuery(), {
      wrapper,
    });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));

    const { result: mutation } = renderHook(() => useAddWishlistMutation(), {
      wrapper,
    });

    act(() => {
      mutation.current.mutate({ productId: product.id, product });
    });

    await waitFor(() => expect(mutation.current.isError).toBe(true));
    expect(
      queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY),
    ).toEqual([]);
  });
});
