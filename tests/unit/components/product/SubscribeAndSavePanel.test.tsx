import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { SubscribeAndSavePanel } from '@/components/product/SubscribeAndSavePanel';
import type { Product } from '@/types/product';
import type { SubscriptionInterval } from '@/types/subscription';

const PRODUCT: Product = {
  id: 'prod-x',
  slug: 'grain-free-kitty',
  name: 'Grain Free Kitty',
  description: 'Yum',
  priceCents: 5000,
  category: 'food',
  petType: 'cat',
  images: [
    {
      id: 'i1',
      url: '/images/hero-placeholder.jpg',
      alt: 'x',
      isPrimary: true,
    },
  ],
  inStock: true,
  stockCount: 5,
  tags: [],
  createdAt: '2025-01-01',
  subscription: {
    enabled: true,
    intervals: ['2_weeks', '4_weeks'] as SubscriptionInterval[],
    discountPercent: 10,
  },
};

const mutateAsyncMock = vi.fn();

vi.mock('@/hooks/useCart', () => ({
  useCartActions: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    setQuantity: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
    clear: vi.fn(),
  }),
  useCartHasHydrated: () => true,
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  })),
}));

vi.mock('@/hooks/usePets', () => ({
  usePetsQuery: vi.fn(() => ({
    data: [],
    isFetched: true,
  })),
}));

vi.mock('@/hooks/useSubscriptions', () => ({
  useCreateSubscriptionCheckoutMutation: vi.fn(() => ({
    isPending: false,
    mutateAsync: mutateAsyncMock,
  })),
}));

function renderPanel(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe('SubscribeAndSavePanel', () => {
  beforeEach(() => mutateAsyncMock.mockReset());

  it('returns null when subscribe is unavailable', () => {
    renderPanel(
      <SubscribeAndSavePanel
        product={{ ...PRODUCT, subscription: undefined }}
      />,
    );
    expect(screen.queryByText(/Subscribe & Save/)).not.toBeInTheDocument();
  });

  it('renders quantity selector when one-time is selected', () => {
    renderPanel(<SubscribeAndSavePanel product={PRODUCT} />);
    expect(
      screen.getByRole('button', { name: 'Add to cart' }),
    ).toBeInTheDocument();
  });

  it('shows cadence radios when Subscribe & Save tab is picked', async () => {
    const user = userEvent.setup();
    renderPanel(<SubscribeAndSavePanel product={PRODUCT} />);
    await user.click(screen.getByRole('button', { name: 'Subscribe & Save' }));
    expect(
      screen.getByRole('radiogroup', { name: 'Subscribe and save cadence' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Every 2 weeks/i)).toBeInTheDocument();
  });

  it('guides signed-out shoppers to login', async () => {
    const user = userEvent.setup();
    renderPanel(<SubscribeAndSavePanel product={PRODUCT} />);
    await user.click(screen.getByRole('button', { name: 'Subscribe & Save' }));
    const signIn = screen.getByRole('link', { name: 'Sign in' });
    expect(signIn.getAttribute('href')).toContain('/login?redirect=');
  });
});
