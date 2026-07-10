import { describe, expect, it } from 'vitest';
import {
  buildProductListingSearchParams,
  legacyProductListingRedirectPath,
  parseProductFilters,
} from '@/lib/utils/searchParams';

describe('parseProductFilters', () => {
  it('maps legacy API nav category params to petType', () => {
    expect(parseProductFilters({ category: 'CAT' })).toEqual({
      petType: 'cat',
    });
    expect(parseProductFilters({ category: 'dog' })).toEqual({
      petType: 'dog',
    });
  });

  it('drops unsupported fish/bird pet types', () => {
    expect(parseProductFilters({ category: 'FISH' })).toEqual({});
    expect(parseProductFilters({ petType: 'bird' })).toEqual({});
    expect(parseProductFilters({ petType: 'fish' })).toEqual({});
  });

  it('keeps storefront shelf categories', () => {
    expect(parseProductFilters({ category: 'treats' })).toEqual({
      category: 'treats',
    });
    expect(parseProductFilters({ category: 'ACCESSORIES' })).toEqual({
      category: 'accessories',
    });
  });

  it('prefers explicit petType over category', () => {
    expect(parseProductFilters({ petType: 'dog', category: 'CAT' })).toEqual({
      petType: 'dog',
    });
  });

  it('falls back to category when petType is unsupported', () => {
    expect(parseProductFilters({ petType: 'bird', category: 'CAT' })).toEqual({
      petType: 'cat',
    });
  });
});

describe('legacyProductListingRedirectPath', () => {
  it('rewrites category=CAT to petType=cat', () => {
    expect(legacyProductListingRedirectPath({ category: 'CAT' })).toBe(
      '/products?petType=cat',
    );
  });

  it('returns null when the URL is already canonical', () => {
    expect(
      legacyProductListingRedirectPath({ petType: 'cat', search: 'treats' }),
    ).toBeNull();
  });
});

describe('buildProductListingSearchParams', () => {
  it('emits canonical filter keys', () => {
    const params = buildProductListingSearchParams(
      { petType: 'cat', search: 'cocktail', sort: 'newest' },
      { page: '2' },
    );
    expect(params.toString()).toBe(
      'petType=cat&search=cocktail&sort=newest&page=2',
    );
  });
});
