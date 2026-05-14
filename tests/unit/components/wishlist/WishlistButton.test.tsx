/**
 * Wishlist heart control — signed-out redirect + interaction boundaries.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { oneFeaturedProduct } from '@/tests/fixtures/products';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/products',
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  }),
}));

beforeEach(() => {
  push.mockReset();
});

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe('WishlistButton', () => {
  it('redirects to login when signed out', async () => {
    const user = userEvent.setup();
    const product = oneFeaturedProduct();

    renderWithQuery(<WishlistButton product={product} variant="inline" />);

    await user.click(screen.getByRole('button', { name: /save to wishlist/i }));

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining('/login?redirect='),
    );
  });

  it('uses aria-pressed false when not saved', () => {
    const product = oneFeaturedProduct();
    renderWithQuery(<WishlistButton product={product} />);

    expect(
      screen.getByRole('button', { name: /save to wishlist/i }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
