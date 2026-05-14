/**
 * Covers the framework-agnostic `useCartStore` from `lib/store/cart.ts`.
 *
 * What's covered:
 *   - add: new line, merges into existing line, respects stockCount cap,
 *     ignores out-of-stock products, bumps `bumpCounter`.
 *   - remove: drops the line; no-op when the productId isn't present.
 *   - setQuantity: clamps to >= 1 (treats <=0 as remove), clamps to
 *     <= stockCount, ignores unknown productIds.
 *   - increment / decrement: mirror clamp behaviour, decrement at qty 1
 *     removes the line.
 *   - clear: empties.
 *   - replaceLines: wholesale swap for email recovery; bumps animation
 *     counter exactly once whenever the inbound snapshot carries items,
 *     and mirrors `clear()` stamping `lastRemovedAt` when emptied.
 *   - selectors (subtotal, count) computed by reducing over `lines`.
 *   - persistence: the persist middleware writes the partialised
 *     `{ lines }` shape to the in-memory Storage stub.
 *
 * Mock boundary: the in-memory `Storage` stub from
 * `tests/mocks/cart-storage`. The store itself is the real
 * implementation. The Zustand singleton is reset to its initial shape
 * inside `beforeEach`.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  installCartStorageStub,
  getStorageStub,
} from '@/tests/mocks/cart-storage';
import {
  oneFeaturedProduct,
  outOfStockProduct,
} from '@/tests/fixtures/products';
import { useCartStore, type CartLine } from '@/lib/store/cart';

const STORAGE_KEY = 'pawsupply-cart-v1';

beforeEach(() => {
  installCartStorageStub();
  useCartStore.setState({
    lines: [],
    bumpCounter: 0,
    hasHydrated: true,
    lastRemovedAt: 0,
  });
});

function subtotal(lines: { priceCents: number; quantity: number }[]): number {
  return lines.reduce((acc, line) => acc + line.priceCents * line.quantity, 0);
}

function count(lines: { quantity: number }[]): number {
  return lines.reduce((acc, line) => acc + line.quantity, 0);
}

describe('useCartStore', () => {
  describe('add', () => {
    it('creates a new line for a previously-uncarted product', () => {
      const product = oneFeaturedProduct();

      useCartStore.getState().add(product, 2);

      const { lines } = useCartStore.getState();
      expect(lines).toHaveLength(1);
      expect(lines[0]?.productId).toBe(product.id);
      expect(lines[0]?.quantity).toBe(2);
      expect(lines[0]?.priceCents).toBe(product.priceCents);
    });

    it('merges quantity into an existing line', () => {
      const product = oneFeaturedProduct();

      useCartStore.getState().add(product, 2);
      useCartStore.getState().add(product, 1);

      const { lines } = useCartStore.getState();
      expect(lines).toHaveLength(1);
      expect(lines[0]?.quantity).toBe(3);
    });

    it('clamps merged quantity to stockCount', () => {
      const product = { ...oneFeaturedProduct(), stockCount: 3 };

      useCartStore.getState().add(product, 2);
      useCartStore.getState().add(product, 5);

      const { lines } = useCartStore.getState();
      expect(lines[0]?.quantity).toBe(3);
    });

    it('ignores out-of-stock products', () => {
      const product = outOfStockProduct();

      useCartStore.getState().add(product, 1);

      expect(useCartStore.getState().lines).toHaveLength(0);
    });

    it('bumps `bumpCounter` on every successful add', () => {
      const product = oneFeaturedProduct();

      useCartStore.getState().add(product, 1);
      useCartStore.getState().add(product, 1);

      expect(useCartStore.getState().bumpCounter).toBe(2);
    });
  });

  describe('remove', () => {
    it('drops the line for a known productId', () => {
      const product = oneFeaturedProduct();
      useCartStore.getState().add(product, 1);

      useCartStore.getState().remove(product.id);

      expect(useCartStore.getState().lines).toHaveLength(0);
    });

    it('is a no-op for an unknown productId', () => {
      useCartStore.getState().remove('not-in-cart');
      expect(useCartStore.getState().lines).toHaveLength(0);
    });
  });

  describe('setQuantity', () => {
    it('clamps to stockCount (does not exceed the cap)', () => {
      const product = { ...oneFeaturedProduct(), stockCount: 5 };
      useCartStore.getState().add(product, 1);

      useCartStore.getState().setQuantity(product.id, 99);

      expect(useCartStore.getState().lines[0]?.quantity).toBe(5);
    });

    it('removes the line when called with 0 or less', () => {
      const product = oneFeaturedProduct();
      useCartStore.getState().add(product, 1);

      useCartStore.getState().setQuantity(product.id, 0);

      expect(useCartStore.getState().lines).toHaveLength(0);
    });

    it('is a no-op for an unknown productId', () => {
      useCartStore.getState().setQuantity('not-in-cart', 5);
      expect(useCartStore.getState().lines).toHaveLength(0);
    });
  });

  describe('increment / decrement', () => {
    it('increments respect stockCount and decrements at qty 1 remove the line', () => {
      const product = { ...oneFeaturedProduct(), stockCount: 2 };
      useCartStore.getState().add(product, 1);

      useCartStore.getState().increment(product.id);
      expect(useCartStore.getState().lines[0]?.quantity).toBe(2);

      useCartStore.getState().increment(product.id);
      expect(useCartStore.getState().lines[0]?.quantity).toBe(2);

      useCartStore.getState().decrement(product.id);
      expect(useCartStore.getState().lines[0]?.quantity).toBe(1);

      useCartStore.getState().decrement(product.id);
      expect(useCartStore.getState().lines).toHaveLength(0);
    });

    it('increment / decrement on unknown productIds are no-ops', () => {
      useCartStore.getState().increment('not-in-cart');
      useCartStore.getState().decrement('not-in-cart');
      expect(useCartStore.getState().lines).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('empties the lines array and stamps lastRemovedAt', () => {
      const product = oneFeaturedProduct();
      useCartStore.getState().add(product, 2);

      useCartStore.getState().clear();

      expect(useCartStore.getState().lines).toHaveLength(0);
      expect(useCartStore.getState().lastRemovedAt).toBeGreaterThan(0);
    });
  });

  describe('replaceLines', () => {
    function buildLine(
      seed: Partial<CartLine> & Pick<CartLine, 'productId'>,
    ): CartLine {
      const now = new Date().toISOString();
      return {
        slug: 'slug',
        name: 'Thing',
        priceCents: 500,
        imageUrl: '',
        category: 'food',
        petType: 'dog',
        stockCount: 99,
        quantity: 1,
        addedAt: now,
        ...seed,
      };
    }

    it('rewrites persisted lines wholesale', () => {
      const incoming: CartLine[] = [
        buildLine({ productId: 'recovery-1' }),
        buildLine({
          productId: 'recovery-2',
          quantity: 4,
          priceCents: 777,
          name: 'Crunchies',
        }),
      ];

      useCartStore.getState().replaceLines(incoming);

      expect(useCartStore.getState().lines).toStrictEqual(incoming);
    });

    it('bumps `bumpCounter` once whenever the inbound snapshot carries items', () => {
      const product = oneFeaturedProduct();

      useCartStore.getState().add(product, 1);
      const beforeBump = useCartStore.getState().bumpCounter;

      useCartStore.getState().replaceLines([
        buildLine({
          productId: 'recovery-1',
        }),
        buildLine({
          productId: 'recovery-2',
        }),
        buildLine({
          productId: 'recovery-3',
        }),
      ]);

      expect(useCartStore.getState().bumpCounter).toBe(beforeBump + 1);
    });

    it('does not bump `bumpCounter` yet still stamps `lastRemovedAt` when emptying', () => {
      const product = oneFeaturedProduct();

      useCartStore.getState().add(product, 2);
      const beforeBump = useCartStore.getState().bumpCounter;

      useCartStore.getState().replaceLines([]);

      expect(useCartStore.getState().bumpCounter).toBe(beforeBump);
      expect(useCartStore.getState().lastRemovedAt).toBeGreaterThan(0);
    });
  });

  describe('selectors', () => {
    it('subtotal sums (priceCents * quantity) across lines', () => {
      const a = { ...oneFeaturedProduct(), id: 'a', priceCents: 1000 };
      const b = { ...oneFeaturedProduct(), id: 'b', priceCents: 2500 };
      useCartStore.getState().add(a, 2);
      useCartStore.getState().add(b, 1);

      expect(subtotal(useCartStore.getState().lines)).toBe(2 * 1000 + 1 * 2500);
    });

    it('count sums quantities across lines', () => {
      const a = { ...oneFeaturedProduct(), id: 'a' };
      const b = { ...oneFeaturedProduct(), id: 'b' };
      useCartStore.getState().add(a, 2);
      useCartStore.getState().add(b, 3);

      expect(count(useCartStore.getState().lines)).toBe(5);
    });
  });

  describe('persistence', () => {
    it('serialises the partialised { lines } payload to localStorage on add', () => {
      const product = oneFeaturedProduct();

      useCartStore.getState().add(product, 1);

      const raw = getStorageStub().getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string) as {
        state: { lines: { productId: string }[] };
      };
      expect(parsed.state.lines).toHaveLength(1);
      expect(parsed.state.lines[0]?.productId).toBe(product.id);
    });

    it('clear empties the persisted payload', () => {
      const product = oneFeaturedProduct();
      useCartStore.getState().add(product, 1);
      useCartStore.getState().clear();

      const raw = getStorageStub().getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw as string) as {
        state: { lines: unknown[] };
      };
      expect(parsed.state.lines).toEqual([]);
    });
  });
});
