import type { Product } from '@/types/product';

/** Pick live curated products or fall back to placeholders. */
export function resolveFeaturedDisplay(
  liveProducts: Product[],
  placeholderProducts: Product[],
  limit = 6,
): Product[] {
  if (liveProducts.length > 0) {
    return liveProducts.slice(0, limit);
  }
  return placeholderProducts.slice(0, limit);
}
