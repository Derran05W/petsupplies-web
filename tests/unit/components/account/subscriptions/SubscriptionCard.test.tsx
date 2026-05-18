import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';

import { SubscriptionCard } from '@/components/account/subscriptions/SubscriptionCard';

import type { Subscription } from '@/types/subscription';

const SUB_ROW: Subscription = {
  id: 'sub-q',
  productId: 'p',
  productSlug: 'p',
  productName: 'Product Q',
  productImageUrl: '/images/hero-placeholder.jpg',
  quantity: 1,
  interval: '4_weeks',
  unitPriceCents: 1200,
  status: 'active',
  cancelAtPeriodEnd: false,
  currentPeriodEnd: '2035-06-01T00:00:00.000Z',
  petId: null,
  createdAt: '2035-01-01',
};

const noop = () => {};
vi.mock('@/hooks/useSubscriptions', () => ({
  usePauseSubscriptionMutation: () => ({
    mutate: noop,
    isPending: false,
  }),
  useResumeSubscriptionMutation: () => ({
    mutate: noop,
    isPending: false,
  }),
  useCancelSubscriptionMutation: () => ({
    mutateAsync: vi.fn(async () => undefined),
    isPending: false,
  }),
  useUpdateSubscriptionMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSubscriptionsQuery: vi.fn(),
  useCreateSubscriptionCheckoutMutation: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signOut: vi.fn() }),
}));

vi.mock('@/hooks/usePets', () => ({
  usePetsQuery: () => ({ data: [] }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function wrap(ui: ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('SubscriptionCard', () => {
  it('renders headline and Cancel renewal launches confirm dialog', async () => {
    const user = userEvent.setup();
    wrap(<SubscriptionCard subscription={SUB_ROW} />);
    await expect(screen.getByText('Product Q')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Cancel renewal' }));
    await expect(screen.getByRole('dialog')).toBeVisible();
    await expect(
      screen.getByRole('heading', { name: 'Cancel renewal?' }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Keep subscription' }));
    await expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows Cancels on copy when cancellation is scheduled', () => {
    wrap(
      <SubscriptionCard
        subscription={{
          ...SUB_ROW,
          cancelAtPeriodEnd: true,
        }}
      />,
    );
    expect(screen.getByText(/Cancels on/i)).toBeInTheDocument();
  });
});
