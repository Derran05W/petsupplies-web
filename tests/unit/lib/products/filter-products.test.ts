import { describe, expect, it } from 'vitest';
import type { Product } from '@/types/product';
import {
  filterAndPaginateProducts,
  hasShelfFilters,
  needsClientSideProductFilter,
  productMatchesSearch,
  productMatchesShelfFilters,
} from '@/lib/products/filter-products';
const TEST_CATALOGUE: Product[] = [
  {
    id: 't1',
    slug: 'dog-training-treats',
    name: 'Dog Training Treats',
    description: 'Crunchy mini-bites perfect for dog training.',
    priceCents: 999,
    category: 'treats',
    petType: 'dog',
    images: [],
    inStock: true,
    stockCount: 30,
    tags: ['dog', 'training', 'treats'],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 't2',
    slug: 'cat-tuna-treats',
    name: 'Cat Tuna Treats',
    description: 'Irresistible tuna-flavoured rewards for cats.',
    priceCents: 799,
    category: 'treats',
    petType: 'cat',
    images: [],
    inStock: true,
    stockCount: 20,
    tags: ['cat', 'tuna'],
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 't3',
    slug: 'salmon-dry-food',
    name: 'Salmon Dry Food',
    description: 'Grain-free salmon kibble.',
    priceCents: 2999,
    category: 'food',
    petType: 'dog',
    images: [],
    inStock: true,
    stockCount: 50,
    tags: ['salmon', 'grain-free'],
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

const sampleProduct: Product = {
  id: '1',
  slug: 'dog-treats',
  name: 'Peanut Butter Bites',
  description: 'Crunchy rewards for training sessions.',
  priceCents: 1200,
  category: 'treats',
  petType: 'dog',
  images: [],
  inStock: true,
  stockCount: 10,
  tags: ['dog', 'training'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('hasShelfFilters', () => {
  it('returns true when category or petType is set', () => {
    expect(hasShelfFilters({ category: 'treats' })).toBe(true);
    expect(hasShelfFilters({ petType: 'cat' })).toBe(true);
    expect(hasShelfFilters({ search: 'food' })).toBe(false);
  });
});

describe('needsClientSideProductFilter', () => {
  it('returns true when shelf filters or search are active', () => {
    expect(needsClientSideProductFilter({ petType: 'cat' })).toBe(true);
    expect(needsClientSideProductFilter({ search: 'cocktail' })).toBe(true);
    expect(needsClientSideProductFilter({ sort: 'newest' })).toBe(false);
  });
});

describe('productMatchesSearch', () => {
  it('matches product names and slugs by token', () => {
    expect(productMatchesSearch(sampleProduct, 'cocktail')).toBe(false);
    expect(
      productMatchesSearch(
        { ...sampleProduct, name: 'Cat Cocktail', slug: 'cat-cocktail' },
        'cocktail',
      ),
    ).toBe(true);
  });

  it('matches every token across name, tags, and labels', () => {
    expect(productMatchesSearch(sampleProduct, 'dog treats')).toBe(true);
    expect(productMatchesSearch(sampleProduct, 'cat treats')).toBe(false);
    expect(productMatchesSearch(sampleProduct, 'peanut training')).toBe(true);
  });

  it('matches pet type labels', () => {
    expect(productMatchesSearch(sampleProduct, 'dogs')).toBe(true);
  });
});

describe('productMatchesShelfFilters', () => {
  it('respects category and pet type filters', () => {
    expect(
      productMatchesShelfFilters(sampleProduct, { category: 'treats' }),
    ).toBe(true);
    expect(
      productMatchesShelfFilters(sampleProduct, { category: 'food' }),
    ).toBe(false);
    expect(productMatchesShelfFilters(sampleProduct, { petType: 'dog' })).toBe(
      true,
    );
  });
});

describe('filterAndPaginateProducts', () => {
  it('filters catalogue by category and search together', () => {
    const result = filterAndPaginateProducts(TEST_CATALOGUE, {
      category: 'treats',
      search: 'dog',
      page: 1,
      pageSize: 12,
    });

    expect(result.total).toBeGreaterThan(0);
    expect(
      result.products.every(
        (product) =>
          product.category === 'treats' && productMatchesSearch(product, 'dog'),
      ),
    ).toBe(true);
  });

  it('paginates filtered results', () => {
    const result = filterAndPaginateProducts(TEST_CATALOGUE, {
      page: 1,
      pageSize: 2,
    });

    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(TEST_CATALOGUE.length);
    expect(result.totalPages).toBe(Math.ceil(TEST_CATALOGUE.length / 2));
  });
});
