import { describe, expect, it } from 'vitest';
import {
  categoryStripIconKeyFromStorage,
  categoryStripIconStorageKey,
  inferCategoryStripIconKey,
  resolveCategoryStripIconKey,
} from '@/lib/site/category-strip-icons';

describe('category strip icons', () => {
  it('round-trips icon keys through imageUrl storage', () => {
    expect(categoryStripIconStorageKey('dog')).toBe('icon:dog');
    expect(categoryStripIconKeyFromStorage('icon:fish')).toBe('fish');
  });

  it('infers icons from seeded category labels', () => {
    expect(
      inferCategoryStripIconKey({
        label: 'Dogs',
        href: '/products?category=DOG',
      }),
    ).toBe('dog');
    expect(
      inferCategoryStripIconKey({
        label: 'Cats',
        href: '/products?category=CAT',
      }),
    ).toBe('cat');
    expect(
      inferCategoryStripIconKey({
        label: 'Fish',
        href: '/products?category=FISH',
      }),
    ).toBe('fish');
    expect(
      inferCategoryStripIconKey({
        label: 'Birds',
        href: '/products?category=BIRD',
      }),
    ).toBe('bird');
  });

  it('prefers stored icon over legacy photo paths', () => {
    expect(
      resolveCategoryStripIconKey({
        label: 'Dogs',
        href: '/products?category=DOG',
        imageUrl: '/images/categories/dogs.jpg',
      }),
    ).toBe('dog');
  });

  it('uses explicit icon: prefix when set', () => {
    expect(
      resolveCategoryStripIconKey({
        label: 'Custom',
        href: '/products',
        imageUrl: 'icon:turtle',
      }),
    ).toBe('turtle');
  });
});
