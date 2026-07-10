import type { Product } from './product';

/** Back-in-stock alert row — mirrored from wishlist-style hydration assumptions. */
export interface StockAlert {
  productId: string;
  product: Product;
  createdAt: string;
}

/**
 * Legacy `{ items }` envelope kept for the dev fallbacks. The real backend
 * returns a `{ data: [...] }` paginated envelope of `StockAlertItemResponse`
 * rows (minimal product snapshot), translated in
 * [lib/api/stockAlerts.ts](../lib/api/stockAlerts.ts).
 */
export interface StockAlertListPayload {
  items?: StockAlert[];
}
