/**
 * Covers `<RewardProgress />` (components/cart/RewardProgress.tsx).
 *
 * Mock boundary: `@/hooks/useCart`'s `useRewardsProgress` is mocked so we can
 * drive each track state (feature off, before/between/after tiers) directly.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RewardProgress } from '@/components/cart/RewardProgress';
import type { RewardsProgress } from '@/hooks/useCart';
import type { RewardTier } from '@/types/site';

const useRewardsProgressMock = vi.fn<() => RewardsProgress>();

vi.mock('@/hooks/useCart', () => ({
  useRewardsProgress: () => useRewardsProgressMock(),
}));

const TIERS: RewardTier[] = [
  { thresholdCents: 0, label: 'Free sample' },
  { thresholdCents: 4900, label: 'Dish sponge' },
  { thresholdCents: 19900, label: 'Feeding mat' },
];

function state(overrides: Partial<RewardsProgress>): RewardsProgress {
  return {
    tiers: TIERS,
    subtotalCents: 0,
    nextTier: TIERS[1]!,
    remainingToNextCents: 4900,
    unlockedCount: 1,
    progress: 0,
    ...overrides,
  };
}

beforeEach(() => {
  useRewardsProgressMock.mockReset();
});

describe('cart/RewardProgress', () => {
  it('renders nothing when no tiers are configured', () => {
    useRewardsProgressMock.mockReturnValue(
      state({ tiers: [], nextTier: null, unlockedCount: 0 }),
    );
    const { container } = render(<RewardProgress />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the "spend more to unlock" copy before the first paid tier', () => {
    useRewardsProgressMock.mockReturnValue(
      state({
        subtotalCents: 0,
        // A configuration whose first tier is paid ($49): nothing unlocked yet.
        tiers: [TIERS[1]!, TIERS[2]!],
        nextTier: TIERS[1]!,
        unlockedCount: 0,
        remainingToNextCents: 4900,
        progress: 0,
      }),
    );
    render(<RewardProgress />);
    expect(
      screen.getByText(/Spend \$49\.00 more to unlock a free gift/i),
    ).toBeInTheDocument();
  });

  it('shows the between-tiers copy naming the unlocked and next reward', () => {
    useRewardsProgressMock.mockReturnValue(
      state({
        subtotalCents: 6000,
        nextTier: TIERS[2]!,
        unlockedCount: 2,
        remainingToNextCents: 19900 - 6000,
        progress: 6000 / 19900,
      }),
    );
    render(<RewardProgress />);
    expect(
      screen.getByText(
        /You've unlocked Dish sponge! Spend \$139\.00 more for Feeding mat/i,
      ),
    ).toBeInTheDocument();
  });

  it('shows "All gifts unlocked" once every tier is reached', () => {
    useRewardsProgressMock.mockReturnValue(
      state({
        subtotalCents: 25000,
        nextTier: null,
        unlockedCount: 3,
        remainingToNextCents: 0,
        progress: 1,
      }),
    );
    render(<RewardProgress />);
    expect(screen.getByText('All gifts unlocked')).toBeInTheDocument();
  });

  it('sets progressbar aria values from the piecewise track position', () => {
    useRewardsProgressMock.mockReturnValue(
      state({ subtotalCents: 6000, progress: 0.5, unlockedCount: 2 }),
    );
    render(<RewardProgress />);
    const bar = screen.getByRole('progressbar', {
      name: 'Gift rewards progress',
    });
    // Nodes sit at segment centers (16.67% / 50% / 83.33%); $60.00 sits
    // $11 into the $49→$199 span past the second node: 50 + (1100/15000)·33.33 ≈ 52.
    expect(bar).toHaveAttribute('aria-valuenow', '52');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders a node caption per tier, with "Any purchase" for the $0 tier', () => {
    useRewardsProgressMock.mockReturnValue(
      state({ subtotalCents: 6000, unlockedCount: 2, progress: 6000 / 19900 }),
    );
    render(<RewardProgress />);
    expect(screen.getByText('Any purchase')).toBeInTheDocument();
    expect(screen.getByText('Spend $49.00')).toBeInTheDocument();
    expect(screen.getByText('Spend $199.00')).toBeInTheDocument();
    // Reward labels appear (once in headline microcopy is fine; captions add more).
    expect(screen.getAllByText('Feeding mat').length).toBeGreaterThanOrEqual(1);
  });

  it('compact variant renders a single-line bar with aria values', () => {
    useRewardsProgressMock.mockReturnValue(
      state({ subtotalCents: 0, unlockedCount: 0, progress: 0 }),
    );
    render(<RewardProgress compact />);
    const bar = screen.getByRole('progressbar', {
      name: 'Gift rewards progress',
    });
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });
});
