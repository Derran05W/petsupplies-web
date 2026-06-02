/**
 * Covers `<CartItem />` from `components/cart/CartItem.tsx`.
 *
 * What's covered:
 *   - renders the line name, formatted unit price, formatted line total,
 *     and current quantity.
 *   - "+" calls `useCartActions().increment(productId)` and respects
 *     stockCount (disabled when qty === stockCount).
 *   - "-" calls `useCartActions().decrement(productId)` and is disabled
 *     when qty === 1.
 *   - Remove button calls `useCartActions().remove(productId)`.
 *
 * Mock boundary: the real Zustand store + the in-memory Storage stub.
 * Asserting against store state proves the integrated path (button →
 * action → state mutation) without stubbing the actions surface.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartItem } from '@/components/cart/CartItem';
import { useCartStore } from '@/lib/store/cart';
import { installCartStorageStub } from '@/tests/mocks/cart-storage';
import { oneFeaturedProduct } from '@/tests/fixtures/products';
import { formatPrice } from '@/lib/utils/format';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

vi.mock('@/hooks/useServerCart', () => ({
  useServerCartQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
  }),
  useAddCartItemMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCartItemMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveCartItemMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useApplyCartDiscountMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useRemoveCartDiscountMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useClearServerCartMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

beforeEach(() => {
  installCartStorageStub();
  useCartStore.setState({
    lines: [],
    bumpCounter: 0,
    hasHydrated: true,
    lastRemovedAt: 0,
  });
});

function seedLine(quantity = 2, stockCount = 5) {
  const product = { ...oneFeaturedProduct(), stockCount };
  useCartStore.getState().add(product, quantity);
  const line = useCartStore.getState().lines[0];
  if (!line) throw new Error('seeded line not present');
  return line;
}

describe('CartItem', () => {
  describe('renders', () => {
    it('shows quantity, unit price, and line total', () => {
      const line = seedLine(3);

      render(<CartItem line={line} />);

      expect(
        screen.getByRole('heading', { name: line.name }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatPrice(line.priceCents)),
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatPrice(line.priceCents * line.quantity)),
      ).toBeInTheDocument();
      expect(screen.getByText(String(line.quantity))).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('"+" increments the line quantity', async () => {
      const user = userEvent.setup();
      const line = seedLine(2, 5);

      render(<CartItem line={line} />);

      const increase = screen.getByRole('button', {
        name: `Increase quantity for ${line.name}`,
      });
      await user.click(increase);

      expect(useCartStore.getState().lines[0]?.quantity).toBe(3);
    });

    it('"-" decrements the line quantity', async () => {
      const user = userEvent.setup();
      const line = seedLine(3, 5);

      render(<CartItem line={line} />);

      const decrease = screen.getByRole('button', {
        name: `Decrease quantity for ${line.name}`,
      });
      await user.click(decrease);

      expect(useCartStore.getState().lines[0]?.quantity).toBe(2);
    });

    it('"-" is disabled when quantity is 1', () => {
      const line = seedLine(1, 5);

      render(<CartItem line={line} />);

      const decrease = screen.getByRole('button', {
        name: `Decrease quantity for ${line.name}`,
      });
      expect(decrease).toBeDisabled();
    });

    it('"+" is disabled when quantity equals stockCount', () => {
      const line = seedLine(2, 2);

      render(<CartItem line={line} />);

      const increase = screen.getByRole('button', {
        name: `Increase quantity for ${line.name}`,
      });
      expect(increase).toBeDisabled();
    });

    it('Remove button removes the line from the cart', async () => {
      const user = userEvent.setup();
      const line = seedLine(2, 5);

      render(<CartItem line={line} />);

      const remove = screen.getByRole('button', {
        name: `Remove ${line.name} from cart`,
      });
      await user.click(remove);

      expect(useCartStore.getState().lines).toHaveLength(0);
    });

    it('clicking the product link fires the optional onNavigate callback (drawer-close hook)', async () => {
      const user = userEvent.setup();
      const line = seedLine(1, 5);
      const onNavigate = vi.fn();

      render(<CartItem line={line} onNavigate={onNavigate} />);

      // Two links lead to the PDP — the image and the title — either
      // closing the drawer is fine; click whichever Testing Library
      // surfaces by accessible name first.
      const link = screen.getByRole('link', { name: `View ${line.name}` });
      await user.click(link);

      expect(onNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
