// TODO(phase 19): line key becomes variantId once product variants land —
// the current `productId` keying assumes one purchasable SKU per product.
import { create } from 'zustand';
import {
  persist,
  subscribeWithSelector,
  type PersistStorage,
  type StorageValue,
} from 'zustand/middleware';
import type { Category, PetType, Product } from '@/types/product';

/**
 * Render-snapshot of the bits of a Product that the cart UI needs. We
 * snapshot at add-time (rather than refetching the product on every cart
 * paint) so the cart survives:
 *   - reload (via persist)
 *   - the original product being edited or unpublished server-side
 *   - the user adding while signed-out, then later being signed-in (Phase 17)
 *
 * `stockCount` is also snapshotted so we can clamp `+` clicks inside the
 * cart UI without having to re-query the backend. When the user starts
 * checkout the backend re-validates against live stock.
 */
export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  category: Category;
  petType: PetType;
  stockCount: number;
  quantity: number;
  /** ISO timestamp; used to sort the drawer (newest first). */
  addedAt: string;
}

export interface CartState {
  lines: CartLine[];
  /**
   * Incremented every time `add()` runs successfully. The cart icon
   * subscribes to this and triggers its bounce animation on change. We
   * intentionally do NOT bump on `increment` / `decrement` from inside
   * the cart UI — that would fire the animation while the user is just
   * adjusting quantities.
   */
  bumpCounter: number;
  /**
   * Flipped to `true` once `persist` finishes rehydrating from
   * localStorage. Components that read `lines` synchronously must gate
   * on this to avoid SSR / client hydration mismatches.
   */
  hasHydrated: boolean;
  /** Timestamp of the last removal — used to drive the live region. */
  lastRemovedAt: number;

  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  /**
   * Replaces persisted lines in one shot (Phase 11 email cart recovery).
   * Bumps {@link bumpCounter} once when the new snapshot is non-empty.
   * When the snapshot is empty, stamps {@link lastRemovedAt} — same semantics
   * as {@link clear}.
   */
  replaceLines: (lines: CartLine[]) => void;
  _setHasHydrated: (value: boolean) => void;
}

const STORAGE_KEY = 'pawsupply-cart-v1';

function pickPrimaryImageUrl(product: Product): string {
  const primary = product.images.find((image) => image.isPrimary);
  const first = product.images[0];
  const chosen = primary ?? first;
  return chosen?.url ?? '';
}

function snapshot(product: Product, quantity: number): CartLine {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    imageUrl: pickPrimaryImageUrl(product),
    category: product.category,
    petType: product.petType,
    stockCount: product.stockCount,
    quantity,
    addedAt: new Date().toISOString(),
  };
}

function clampQuantity(quantity: number, stockCount: number): number {
  if (!Number.isFinite(quantity)) return 1;
  if (quantity < 1) return 1;
  const ceiling = Math.max(1, stockCount);
  return Math.min(ceiling, Math.floor(quantity));
}

/**
 * SSR-safe storage adapter. `persist` calls `getItem` synchronously during
 * `createJSONStorage` setup — on the server `localStorage` is `undefined`,
 * so we return `null` and let the in-memory initial state take over until
 * `onRehydrateStorage` fires on the client.
 */
const ssrSafeStorage: PersistStorage<Pick<CartState, 'lines'>> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(name);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as StorageValue<Pick<CartState, 'lines'>>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

export const useCartStore = create<CartState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        lines: [],
        bumpCounter: 0,
        hasHydrated: false,
        lastRemovedAt: 0,

        add: (product, quantity = 1) => {
          if (!product.inStock || product.stockCount <= 0) return;
          const requested = Math.max(1, Math.floor(quantity));
          const existing = get().lines.find(
            (line) => line.productId === product.id,
          );

          if (existing) {
            const merged = clampQuantity(
              existing.quantity + requested,
              product.stockCount,
            );
            set((state) => ({
              lines: state.lines.map((line) =>
                line.productId === product.id
                  ? {
                      ...line,
                      quantity: merged,
                      // refresh snapshot fields to the latest product data
                      priceCents: product.priceCents,
                      name: product.name,
                      slug: product.slug,
                      imageUrl: pickPrimaryImageUrl(product),
                      category: product.category,
                      petType: product.petType,
                      stockCount: product.stockCount,
                    }
                  : line,
              ),
              bumpCounter: state.bumpCounter + 1,
            }));
            return;
          }

          const initialQuantity = clampQuantity(requested, product.stockCount);
          set((state) => ({
            lines: [snapshot(product, initialQuantity), ...state.lines],
            bumpCounter: state.bumpCounter + 1,
          }));
        },

        remove: (productId) => {
          const had = get().lines.some((line) => line.productId === productId);
          if (!had) return;
          set((state) => ({
            lines: state.lines.filter((line) => line.productId !== productId),
            lastRemovedAt: Date.now(),
          }));
        },

        setQuantity: (productId, quantity) => {
          const target = get().lines.find(
            (line) => line.productId === productId,
          );
          if (!target) return;
          if (quantity <= 0) {
            set((state) => ({
              lines: state.lines.filter((line) => line.productId !== productId),
              lastRemovedAt: Date.now(),
            }));
            return;
          }
          const next = clampQuantity(quantity, target.stockCount);
          set((state) => ({
            lines: state.lines.map((line) =>
              line.productId === productId ? { ...line, quantity: next } : line,
            ),
          }));
        },

        increment: (productId) => {
          const target = get().lines.find(
            (line) => line.productId === productId,
          );
          if (!target) return;
          const next = clampQuantity(target.quantity + 1, target.stockCount);
          if (next === target.quantity) return;
          set((state) => ({
            lines: state.lines.map((line) =>
              line.productId === productId ? { ...line, quantity: next } : line,
            ),
          }));
        },

        decrement: (productId) => {
          const target = get().lines.find(
            (line) => line.productId === productId,
          );
          if (!target) return;
          if (target.quantity <= 1) {
            set((state) => ({
              lines: state.lines.filter((line) => line.productId !== productId),
              lastRemovedAt: Date.now(),
            }));
            return;
          }
          set((state) => ({
            lines: state.lines.map((line) =>
              line.productId === productId
                ? { ...line, quantity: line.quantity - 1 }
                : line,
            ),
          }));
        },

        clear: () => set({ lines: [], lastRemovedAt: Date.now() }),

        replaceLines: (lines) =>
          set((state) => {
            const next = lines;
            const empty = next.length === 0;
            return {
              lines: next,
              bumpCounter: empty ? state.bumpCounter : state.bumpCounter + 1,
              lastRemovedAt: empty ? Date.now() : state.lastRemovedAt,
            };
          }),

        _setHasHydrated: (value) => set({ hasHydrated: value }),
      }),
      {
        name: STORAGE_KEY,
        version: 1,
        storage: ssrSafeStorage,
        partialize: (state) => ({ lines: state.lines }),
        // Empty migrate today — bump `version` and add a case here when
        // the persisted shape changes (e.g. Phase 19 variants).
        migrate: (persisted, _version) => {
          return persisted as Pick<CartState, 'lines'>;
        },
        onRehydrateStorage: () => (state) => {
          state?._setHasHydrated(true);
        },
      },
    ),
  ),
);
