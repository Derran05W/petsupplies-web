/**
 * Matches `usePets.test.tsx` — mocks Supabase + lib/api subscriptions.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { mockSupabaseClient } from '@/tests/mocks/supabase';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { Subscription } from '@/types/subscription';
import {
  usePauseSubscriptionMutation,
  useSubscriptionsQuery,
} from '@/hooks/useSubscriptions';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () =>
    mockSupabaseClient({ session: { access_token: 'token-123' } }),
}));

const apiListMock = vi.fn();
const apiPauseMock = vi.fn();

vi.mock('@/lib/api/subscriptions', () => ({
  listSubscriptions: (...args: unknown[]) => apiListMock(...args),
  createSubscriptionCheckout: vi.fn(),
  updateSubscription: vi.fn(),
  pauseSubscription: (...args: unknown[]) => apiPauseMock(...args),
  resumeSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  isSubscriptionDiscountConflict: vi.fn(),
}));

beforeEach(() => {
  apiListMock.mockReset();
  apiPauseMock.mockReset();
});

function makeWrapper(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

const SUB_A: Subscription = {
  id: 'sub-a',
  productId: 'p-a',
  productSlug: 'a',
  productName: 'A',
  productImageUrl: '',
  quantity: 1,
  interval: '4_weeks',
  unitPriceCents: 900,
  status: 'active',
  cancelAtPeriodEnd: false,
  currentPeriodEnd: '2030-01-01',
  petId: null,
  createdAt: '2030-01-01',
};

describe('useSubscriptions hooks', () => {
  it('useSubscriptionsQuery loads list', async () => {
    apiListMock.mockResolvedValue([SUB_A]);
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0, staleTime: 0 },
        mutations: { retry: false },
      },
    });
    const wrapper = makeWrapper(queryClient);

    const { result } = renderHook(
      () => useSubscriptionsQuery({ enabled: true }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([SUB_A]);
  });

  it('pause mutation optimistic sets status paused', async () => {
    apiListMock.mockResolvedValue([SUB_A]);
    const resolved: Subscription = { ...SUB_A, status: 'paused' };
    let release!: (value: Subscription) => void;
    apiPauseMock.mockImplementation(
      () =>
        new Promise<Subscription>((resolve) => {
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

    const { result: q } = renderHook(
      () => useSubscriptionsQuery({ enabled: true }),
      { wrapper },
    );
    await waitFor(() => expect(q.current.isSuccess).toBe(true));

    const { result: mut } = renderHook(() => usePauseSubscriptionMutation(), {
      wrapper,
    });

    act(() => {
      mut.current.mutate(SUB_A.id);
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<Subscription[]>([
        'account',
        'subscriptions',
      ]);
      expect(cached?.[0]?.status).toBe('paused');
    });

    await act(async () => {
      release(resolved);
    });

    await waitFor(() => expect(mut.current.isSuccess).toBe(true));
  });
});
