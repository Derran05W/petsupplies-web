import type { Product } from '@/types/product';

/** Single saved wishlist row — backend hydrates `product` for cart hand-off. */
export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface WishlistListResponse {
  items: WishlistItem[];
}
