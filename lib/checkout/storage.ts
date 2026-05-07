/**
 * sessionStorage helpers for the "pending checkout" snapshot used by the
 * placeholder fallback path.
 *
 * When the backend is unreachable, `createCheckoutSession` writes the cart
 * + form values here under `pawsupply-pending-checkout-v1`, then redirects
 * to `/checkout/success?session_id=cs_test_placeholder`. The success page
 * reads the snapshot back to synthesise an `OrderSummary` so the entire
 * Phase 6 surface can be exercised in dev without the staging API.
 *
 * sessionStorage (not localStorage) on purpose: the snapshot is per-tab
 * and shouldn't survive a browser restart — the real backend is the source
 * of truth once it's up.
 *
 * TODO(phase 6): remove once backend phase 6 + 7 are on staging.
 */
import type { CartLine } from '@/lib/store/cart';
import type { ShippingAddress } from '@/types/order';

const STORAGE_KEY = 'pawsupply-pending-checkout-v1';

export interface PendingCheckoutSnapshot {
  email: string;
  shippingAddress: ShippingAddress;
  lines: CartLine[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  createdAt: string;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function savePendingCheckout(snapshot: PendingCheckoutSnapshot): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota exceeded or denied — fallback path will surface a friendly
    // "we can't find that checkout" panel on the success page.
  }
}

export function loadPendingCheckout(): PendingCheckoutSnapshot | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingCheckoutSnapshot;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}
