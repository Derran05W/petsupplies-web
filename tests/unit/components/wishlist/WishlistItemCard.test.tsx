/**
 * Wishlist row actions — move-to-cart + remove.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistItemCard } from '@/components/wishlist/WishlistItemCard';
import { sampleWishlistItem } from '@/tests/fixtures/wishlist';
import {
  oneFeaturedProduct,
  outOfStockProduct,
} from '@/tests/fixtures/products';
import { mockSupabaseClient } from '@/tests/mocks/supabase';

const mockAdd = vi.fn();
const removeMock = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () =>
    mockSupabaseClient({ session: { access_token: 'tok-wishlist-test' } }),
}));

vi.mock('@/hooks/useCart', () => ({
  useCartActions: () => ({
    add: mockAdd,
    remove: vi.fn(),
    setQuantity: vi.fn(),
    increment: vi.fn(),
    decrement: vi.fn(),
    clear: vi.fn(),
  }),
}));

vi.mock('@/lib/api/wishlist', () => ({
  listWishlist: vi.fn(),
  addWishlistItem: vi.fn(),
  removeWishlistItem: (...args: unknown[]) => removeMock(...args),
}));

beforeEach(() => {
  mockAdd.mockReset();
  removeMock.mockReset();
  removeMock.mockResolvedValue(undefined);
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

describe('WishlistItemCard', () => {
  it('move to cart adds then removes wishlist row', async () => {
    const user = userEvent.setup();
    const item = sampleWishlistItem();

    renderWithQuery(<WishlistItemCard item={item} />);

    await user.click(screen.getByRole('button', { name: /move to cart/i }));

    expect(mockAdd).toHaveBeenCalledWith(item.product, 1);
    await waitFor(() =>
      expect(removeMock).toHaveBeenCalledWith(
        item.product.id,
        expect.objectContaining({ accessToken: 'tok-wishlist-test' }),
      ),
    );
  });

  it('disables move-to-cart when out of stock', () => {
    const item = sampleWishlistItem();
    item.product = outOfStockProduct();

    renderWithQuery(<WishlistItemCard item={item} />);

    expect(
      screen.getByRole('button', { name: /out of stock/i }),
    ).toBeDisabled();
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('remove calls delete API', async () => {
    const user = userEvent.setup();
    const item = sampleWishlistItem();
    item.product = oneFeaturedProduct();

    renderWithQuery(<WishlistItemCard item={item} />);

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`Remove ${item.product.name}`, 'i'),
      }),
    );

    await waitFor(() => expect(removeMock).toHaveBeenCalled());
  });
});
