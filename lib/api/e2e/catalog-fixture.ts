import type { Product } from '@/types/product';

/** Playwright-only SSR catalogue — never enable outside controlled e2e runs. */
export function isE2eCatalogFixtureEnabled(): boolean {
  return process.env.E2E_CATALOG_FIXTURE === '1';
}

const E2E_CATALOG: Product[] = [
  {
    id: 'e2e-prod-cat-cocktail',
    slug: 'cat-cocktail',
    name: 'Cat cocktail',
    description: 'A festive treat for curious cats.',
    priceCents: 1299,
    category: 'treats',
    petType: 'cat',
    images: [
      {
        id: 'e2e-img-cat-cocktail',
        url: '/images/hero-placeholder.jpg',
        alt: 'Cat cocktail',
        isPrimary: true,
      },
    ],
    inStock: true,
    stockCount: 24,
    tags: ['cat', 'treats'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'e2e-prod-dog-shoes',
    slug: 'dog-shoes',
    name: 'Dog shoes',
    description: 'Protective booties for rainy walks.',
    priceCents: 2499,
    category: 'accessories',
    petType: 'dog',
    images: [
      {
        id: 'e2e-img-dog-shoes',
        url: '/images/hero-placeholder.jpg',
        alt: 'Dog shoes',
        isPrimary: true,
      },
    ],
    inStock: true,
    stockCount: 12,
    tags: ['dog', 'accessories'],
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

export function listE2eCatalogProducts(): Product[] {
  return structuredClone(E2E_CATALOG);
}

export function getE2eCatalogProduct(slug: string): Product | null {
  const product = E2E_CATALOG.find((row) => row.slug === slug);
  return product ? structuredClone(product) : null;
}
