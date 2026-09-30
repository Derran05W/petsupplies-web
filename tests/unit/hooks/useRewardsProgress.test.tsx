/**
 * Unit tests for `useRewardsProgress` (hooks/useCart.ts).
 *
 * The hook reads SSR-seeded tiers from `RewardTiersProvider` and the live cart
 * subtotal. We drive the subtotal through the real guest zustand store and mock
 * the auth + server-cart boundaries so the hook resolves to guest mode.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { useRewardsProgress } from '@/hooks/useCart';
import { RewardTiersProvider } from '@/components/providers/RewardTiersProvider';
import type { RewardTier } from '@/types/site';

// Guest cart subtotal is derived from the zustand store's `lines`. We replace
// the persisted store with a plain, settable state object so a test can drive
// the subtotal without touching localStorage.
let storeState: { lines: Array<{ priceCents: number; quantity: number }> } = {
  lines: [],
};

vi.mock('@/lib/store/cart', () => ({
  useCartStore: (selector: (state: typeof storeState) => unknown) =>
    selector(storeState),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signOut: vi.fn() }),
}));

vi.mock('@/hooks/useServerCart', () => ({
  useServerCartQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
  }),
  useAddCartItemMutation: () => ({ mutateAsync: vi.fn() }),
  useUpdateCartItemMutation: () => ({ mutateAsync: vi.fn() }),
  useRemoveCartItemMutation: () => ({ mutateAsync: vi.fn() }),
  useApplyCartDiscountMutation: () => ({ mutateAsync: vi.fn() }),
  useRemoveCartDiscountMutation: () => ({ mutateAsync: vi.fn() }),
  useClearServerCartMutation: () => ({ mutateAsync: vi.fn() }),
}));

const TIERS: RewardTier[] = [
  { thresholdCents: 0, label: 'Free sample' },
  { thresholdCents: 4900, label: 'Dish sponge' },
  { thresholdCents: 19900, label: 'Feeding mat' },
];

function setSubtotal(cents: number) {
  storeState = {
    lines: cents > 0 ? [{ priceCents: cents, quantity: 1 }] : [],
  };
}

function wrapperFor(tiers: RewardTier[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <RewardTiersProvider tiers={tiers}>{children}</RewardTiersProvider>;
  };
}

beforeEach(() => {
  setSubtotal(0);
});

describe('useRewardsProgress', () => {
  it('reports the feature off when no tiers are configured', () => {
    setSubtotal(5000);
    const { result } = renderHook(() => useRewardsProgress(), {
      wrapper: wrapperFor([]),
    });

    expect(result.current.tiers).toEqual([]);
    expect(result.current.nextTier).toBeNull();
    expect(result.current.unlockedCount).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it('computes mid-track progress: a $0 tier unlocked, pointing at the next', () => {
    setSubtotal(6000); // >= 0 and >= 4900, < 19900 -> 2 unlocked
    const { result } = renderHook(() => useRewardsProgress(), {
      wrapper: wrapperFor(TIERS),
    });

    expect(result.current.unlockedCount).toBe(2);
    expect(result.current.nextTier).toEqual({
      thresholdCents: 19900,
      label: 'Feeding mat',
    });
    expect(result.current.remainingToNextCents).toBe(19900 - 6000);
    // 6000 / 19900 max threshold.
    expect(result.current.progress).toBeCloseTo(6000 / 19900, 5);
  });

  it('before the first paid tier, only the $0 tier is unlocked', () => {
    setSubtotal(1000); // >= 0 only
    const { result } = renderHook(() => useRewardsProgress(), {
      wrapper: wrapperFor(TIERS),
    });

    expect(result.current.unlockedCount).toBe(1);
    expect(result.current.nextTier?.thresholdCents).toBe(4900);
    expect(result.current.remainingToNextCents).toBe(4900 - 1000);
  });

  it('marks every tier unlocked and clamps progress at the top', () => {
    setSubtotal(25000); // >= all
    const { result } = renderHook(() => useRewardsProgress(), {
      wrapper: wrapperFor(TIERS),
    });

    expect(result.current.unlockedCount).toBe(TIERS.length);
    expect(result.current.nextTier).toBeNull();
    expect(result.current.remainingToNextCents).toBe(0);
    expect(result.current.progress).toBe(1);
  });

  it('sorts unsorted tiers ascending by threshold', () => {
    setSubtotal(0);
    const { result } = renderHook(() => useRewardsProgress(), {
      wrapper: wrapperFor([
        { thresholdCents: 19900, label: 'Feeding mat' },
        { thresholdCents: 0, label: 'Free sample' },
        { thresholdCents: 4900, label: 'Dish sponge' },
      ]),
    });

    expect(result.current.tiers.map((t) => t.thresholdCents)).toEqual([
      0, 4900, 19900,
    ]);
    // $0 tier unlocked at subtotal 0.
    expect(result.current.unlockedCount).toBe(1);
  });
});
