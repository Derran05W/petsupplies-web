import type { WishlistItem } from '@/types/wishlist';
import { oneFeaturedProduct } from '@/tests/fixtures/products';

export function sampleWishlistItem(): WishlistItem {
  return {
    product: oneFeaturedProduct(),
    addedAt: '2026-02-01T12:00:00.000Z',
  };
}
