/**
 * Optimistic stock-alert mutations — aligned with wishlist hook tests.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockSupabaseClient } from '@/tests/mocks/supabase';
import { STOCK_ALERTS_QUERY_KEY } from '@/lib/stock-alerts/query-key';
import {
  useCreateStockAlertMutation,
  useStockAlertsQuery,
  useDeleteStockAlertMutation,
} from '@/hooks/useStockAlerts';
import { sampleStockAlert } from '@/tests/fixtures/stockAlerts';
import { outOfStockProduct } from '@/tests/fixtures/products';
import type { StockAlert } from '@/types/stock-alert';

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
const createMock = vi.fn();
const deleteMock = vi.fn();

vi.mock('@/lib/api/stockAlerts', () => ({
  listStockAlerts: (...args: unknown[]) => listMock(...args),
  createStockAlert: (...args: unknown[]) => createMock(...args),
  deleteStockAlert: (...args: unknown[]) => deleteMock(...args),
}));

beforeEach(() => {
  listMock.mockReset();
  createMock.mockReset();
  deleteMock.mockReset();
});

function makeWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe('useStockAlerts', () => {
  it('prefetches empty list then create mutation inserts optimistic row before server resolves', async () => {
    const product = outOfStockProduct();
    const seed: StockAlert[] = [];
    const serverRow = sampleStockAlert({
      productId: product.id,
      product,
    });

    listMock.mockResolvedValue(seed);
    let release: (value: StockAlert) => void = () => {};
    createMock.mockImplementation(
      () =>
        new Promise<StockAlert>((resolve) => {
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

    const { result: query } = renderHook(() => useStockAlertsQuery(), {
      wrapper,
    });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));

    const { result: mutation } = renderHook(
      () => useCreateStockAlertMutation(),
      { wrapper },
    );

    act(() => {
      mutation.current.mutate({ productId: product.id, product });
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryData<StockAlert[]>(STOCK_ALERTS_QUERY_KEY),
      ).toMatchObject([{ productId: product.id, product }]),
    );

    await act(async () => {
      release(serverRow);
    });

    await waitFor(() => expect(mutation.current.isSuccess).toBe(true));
  });

  it('delete mutation rolls back on failure', async () => {
    const row = sampleStockAlert();
    const seed = [row];
    listMock.mockResolvedValue(seed);
    deleteMock.mockRejectedValueOnce(new Error('network'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });
    const wrapper = makeWrapper(queryClient);

    const { result: query } = renderHook(() => useStockAlertsQuery(), {
      wrapper,
    });
    await waitFor(() => expect(query.current.isSuccess).toBe(true));

    const { result: mutation } = renderHook(
      () => useDeleteStockAlertMutation(),
      { wrapper },
    );

    act(() => {
      mutation.current.mutate(row.productId);
    });

    await waitFor(() => expect(deleteMock).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        queryClient.getQueryData<StockAlert[]>(STOCK_ALERTS_QUERY_KEY),
      ).toEqual(seed),
    );
  });
});
