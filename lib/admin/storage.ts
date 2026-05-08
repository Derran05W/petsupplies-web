/**
 * localStorage helpers for the dev fallback (admin products + admin
 * order overrides). Mirrors `lib/account/storage.ts` in shape.
 *
 * The admin products store seeds from `FEATURED_PRODUCTS` on first read
 * — without this, the table renders empty in dev before the backend is
 * on staging.
 *
 * The admin order overrides store is read by both the admin orders
 * fallback AND the customer-facing `lib/api/orders.ts` dev-fallback path
 * (additive merge — production path is untouched). When an admin sets
 * an order shipped + adds a tracking number in dev, the same change is
 * visible on `/account/orders/[id]` because both surfaces read from the
 * same overlay.
 *
 * TODO(phase 8): remove fallback once backend phase 8 admin endpoints
 * are on staging.
 */
import type { OrderStatus, OrderSummary } from '@/types/order';
import type { AdminProduct } from '@/types/admin';
import { FEATURED_PRODUCTS } from '@/lib/placeholder/products';

const PRODUCTS_KEY = 'pawsupply-admin-products-dev-v1';
const ORDER_OVERRIDES_KEY = 'pawsupply-admin-order-overrides-dev-v1';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Admin products                                                             */
/* -------------------------------------------------------------------------- */

function seedAdminProducts(): AdminProduct[] {
  return FEATURED_PRODUCTS.map(
    (product): AdminProduct => ({ ...product, isPublished: true }),
  );
}

export function loadAdminProducts(): AdminProduct[] {
  const storage = getStorage();
  if (!storage) {
    return seedAdminProducts();
  }
  const raw = storage.getItem(PRODUCTS_KEY);
  if (!raw) {
    const seeded = seedAdminProducts();
    try {
      storage.setItem(PRODUCTS_KEY, JSON.stringify(seeded));
    } catch {
      // Quota exceeded — fall through; seed is returned but not persisted.
    }
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as AdminProduct[];
    return Array.isArray(parsed) ? parsed : seedAdminProducts();
  } catch {
    return seedAdminProducts();
  }
}

export function saveAdminProducts(products: AdminProduct[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // Quota exceeded — fall through; the in-memory cache is still used.
  }
}

/* -------------------------------------------------------------------------- */
/* Admin order overrides                                                      */
/* -------------------------------------------------------------------------- */

export interface AdminOrderOverride {
  status?: OrderStatus;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

export type AdminOrderOverrideMap = Record<string, AdminOrderOverride>;

export function loadOrderOverrides(): AdminOrderOverrideMap {
  const storage = getStorage();
  if (!storage) return {};
  const raw = storage.getItem(ORDER_OVERRIDES_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as AdminOrderOverrideMap;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveOrderOverrides(map: AdminOrderOverrideMap): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(ORDER_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    // Quota exceeded — fall through.
  }
}

/**
 * Apply the in-process override (if any) to an order summary. Used by
 * both the admin orders fallback and the customer-facing
 * `lib/api/orders.ts` dev-fallback path so a tracking number entered on
 * `/admin/orders` is also visible on `/account/orders/[id]` in the same
 * browser session.
 */
export function applyOrderOverride<T extends OrderSummary>(
  order: T,
  overrides?: AdminOrderOverrideMap,
): T {
  const map = overrides ?? loadOrderOverrides();
  const patch = map[order.id];
  if (!patch) return order;
  const next: T = { ...order };
  if (patch.status) next.status = patch.status;
  if (patch.trackingNumber !== undefined) {
    if (patch.trackingNumber === null || patch.trackingNumber.length === 0) {
      delete next.trackingNumber;
    } else {
      next.trackingNumber = patch.trackingNumber;
    }
  }
  if (patch.trackingUrl !== undefined) {
    if (patch.trackingUrl === null || patch.trackingUrl.length === 0) {
      delete next.trackingUrl;
    } else {
      next.trackingUrl = patch.trackingUrl;
    }
  }
  return next;
}

export function setOrderOverride(
  id: string,
  patch: AdminOrderOverride,
): AdminOrderOverrideMap {
  const map = loadOrderOverrides();
  const next: AdminOrderOverrideMap = {
    ...map,
    [id]: { ...map[id], ...patch },
  };
  saveOrderOverrides(next);
  return next;
}
