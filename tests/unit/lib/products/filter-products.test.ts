import { describe, expect, it } from 'vitest';
import { FEATURED_PRODUCTS } from '@/lib/placeholder/products';
import {
  filterAndPaginateProducts,
  hasShelfFilters,
  needsClientSideProductFilter,
  productMatchesSearch,
  productMatchesShelfFilters,
} from '@/lib/products/filter-products';
import type { Product } from '@/types/product';

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
  it('filters placeholder catalogue by category and search together', () => {
    const result = filterAndPaginateProducts(FEATURED_PRODUCTS, {
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
    const result = filterAndPaginateProducts(FEATURED_PRODUCTS, {
      page: 1,
      pageSize: 2,
    });

    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(FEATURED_PRODUCTS.length);
    expect(result.totalPages).toBe(Math.ceil(FEATURED_PRODUCTS.length / 2));
  });
});
