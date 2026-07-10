import type { Product } from '@/types/product';

/** Single saved wishlist row — backend hydrates `product` for cart hand-off. */
export interface WishlistItem {
  product: Product;
  addedAt: string;
}

/**
 * Legacy `{ items }` envelope kept for the dev fallbacks. The real backend
 * returns a `{ data: [...] }` paginated envelope of `WishlistItemResponse`
 * rows, translated to `WishlistItem` in [lib/api/wishlist.ts](../lib/api/wishlist.ts).
 */
export interface WishlistListResponse {
  items: WishlistItem[];
}
