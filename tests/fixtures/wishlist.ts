import type { WishlistItem } from '@/types/wishlist';
import { oneFeaturedProduct } from '@/tests/fixtures/products';

/** App-shaped wishlist row (already mapped) — for component / hook tests. */
export function sampleWishlistItem(): WishlistItem {
  return {
    product: oneFeaturedProduct(),
    addedAt: '2026-02-01T12:00:00.000Z',
  };
}

/**
 * Real backend `WishlistItemResponse` wire shape — nested minimal product
 * snapshot with `price` (cents), `active`, and Prisma-shaped images. Used by
 * the lib/api/wishlist tests to exercise the wire → app mapper.
 */
export function sampleWishlistApiItem() {
  return {
    id: 'wl-1',
    addedAt: '2026-02-01T12:00:00.000Z',
    product: {
      id: 'prod-1',
      name: 'Salmon Feast',
      slug: 'salmon-feast',
      price: 1299,
      active: true,
      images: [
        {
          id: 'img-1',
          url: 'https://cdn.test/salmon.jpg',
          altText: 'Salmon Feast',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    },
  };
}

/** Backend `{ data: [...] }` paginated envelope for GET /users/me/wishlist. */
export function sampleWishlistApiEnvelope() {
  return {
    data: [sampleWishlistApiItem()],
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };
}
