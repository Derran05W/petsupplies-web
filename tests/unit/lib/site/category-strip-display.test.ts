import { describe, expect, it } from 'vitest';
import { resolveActiveCategoryStripItems } from '@/lib/site/category-strip-display';
import type { CategoryStripItem } from '@/types/site';

describe('resolveActiveCategoryStripItems', () => {
  it('filters inactive items and sorts by position', () => {
    const items: CategoryStripItem[] = [
      {
        id: 'b',
        label: 'B',
        imageUrl: null,
        href: '/b',
        position: 1,
        isActive: true,
      },
      {
        id: 'a',
        label: 'A',
        imageUrl: null,
        href: '/a',
        position: 0,
        isActive: true,
      },
      {
        id: 'hidden',
        label: 'Hidden',
        imageUrl: null,
        href: '/hidden',
        position: 2,
        isActive: false,
      },
    ];

    const result = resolveActiveCategoryStripItems(items);
    expect(result.map((item) => item.id)).toEqual(['a', 'b']);
  });
});
