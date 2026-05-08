/**
 * Thin facade over `lib/placeholder/products.ts` so unit tests don't
 * pin to `FEATURED_PRODUCTS[0]!.something` (brittle if the catalogue
 * is reordered or extended). Each helper returns a *cloned* product
 * so a test that mutates the result can't leak into other tests.
 *
 * Keep the shape of these helpers narrow — anything more elaborate
 * belongs in the placeholder catalogue itself.
 */
import { FEATURED_PRODUCTS } from '@/lib/placeholder/products';
import type { Product } from '@/types/product';

function clone<T>(value: T): T {
  return structuredClone(value);
}

function pick(predicate: (product: Product) => boolean): Product {
  const found = FEATURED_PRODUCTS.find(predicate);
  if (!found) throw new Error('Fixture not found in placeholder catalogue');
  return clone(found);
}

/** A standard featured product (in stock, on sale, has a rating). */
export function oneFeaturedProduct(): Product {
  return pick(
    (p) =>
      p.inStock &&
      typeof p.compareAtPriceCents === 'number' &&
      p.compareAtPriceCents > p.priceCents &&
      Boolean(p.rating),
  );
}

/** An out-of-stock product (covers the "Out of stock" badge branch). */
export function outOfStockProduct(): Product {
  return pick((p) => !p.inStock || p.stockCount === 0);
}

/** A product without a rating chip. */
export function productWithoutRating(): Product {
  // The placeholder catalogue has no rating-less product, so derive one.
  const base = pick(() => true);
  delete base.rating;
  return base;
}

/** A product without a `compareAtPriceCents` (no Sale badge). */
export function productWithoutSale(): Product {
  return pick((p) => p.inStock && typeof p.compareAtPriceCents === 'undefined');
}
