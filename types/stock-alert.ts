import type { Product } from './product';

/** Back-in-stock alert row — mirrored from wishlist-style hydration assumptions. */
export interface StockAlert {
  productId: string;
  product: Product;
  createdAt: string;
}

/** Tolerates `{ items: StockAlert[] }` OR a bare array from GET `/users/me/stock-alerts`. */
export interface StockAlertListPayload {
  items?: StockAlert[];
}
