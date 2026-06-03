/**
 * Minimal inline product fixtures for unit tests. These are standalone
 * and do not rely on any placeholder catalogue modules.
 *
 * Keep the shape of these helpers narrow — anything more elaborate
 * belongs in the test that needs it.
 */
import type { Product } from '@/types/product';

function clone<T>(value: T): T {
  return structuredClone(value);
}

const FIXTURE_CATALOGUE: Product[] = [
  {
    id: 'fix-prod-1',
    slug: 'salmon-dry-dog-food',
    name: 'Salmon Dry Dog Food',
    description: 'Premium grain-free salmon kibble for adult dogs.',
    priceCents: 2999,
    compareAtPriceCents: 3499,
    category: 'food',
    petType: 'dog',
    images: [
      {
        id: 'img-1',
        url: '/images/salmon-kibble.jpg',
        alt: 'Salmon Dry Dog Food bag',
        isPrimary: true,
      },
    ],
    inStock: true,
    stockCount: 48,
    tags: ['grain-free', 'salmon', 'adult'],
    rating: { avg: 4.8, count: 24 },
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'fix-prod-2',
    slug: 'tuna-cat-treats',
    name: 'Tuna Cat Treats',
    description: 'Irresistible tuna-flavoured treats for cats.',
    priceCents: 899,
    category: 'treats',
    petType: 'cat',
    images: [],
    inStock: false,
    stockCount: 0,
    tags: ['cat', 'tuna', 'treats'],
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'fix-prod-3',
    slug: 'bird-seed-mix',
    name: 'Bird Seed Mix',
    description: 'Nutritious seed blend for pet birds.',
    priceCents: 1299,
    category: 'food',
    petType: 'bird',
    images: [],
    inStock: true,
    stockCount: 15,
    tags: ['seed', 'bird'],
    createdAt: '2026-01-15T09:00:00.000Z',
  },
];

function pick(predicate: (product: Product) => boolean): Product {
  const found = FIXTURE_CATALOGUE.find(predicate);
  if (!found) throw new Error('Fixture not found in test catalogue');
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
  const base = pick(() => true);
  delete base.rating;
  return base;
}

/** A product without a `compareAtPriceCents` (no Sale badge). */
export function productWithoutSale(): Product {
  return pick((p) => p.inStock && typeof p.compareAtPriceCents === 'undefined');
}
