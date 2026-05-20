import type { CategoryStripItem } from '@/types/site';
import { categoryStripIconStorageKey } from '@/lib/site/category-strip-icons';

/** Build-time category strip when `GET /site/category-strip` is unreachable. */
export const CATEGORY_STRIP_FALLBACK: CategoryStripItem[] = [
  {
    id: 'fallback-all',
    label: 'All',
    imageUrl: categoryStripIconStorageKey('layout-grid'),
    href: '/products',
    position: 0,
    isActive: true,
  },
  {
    id: 'fallback-dogs',
    label: 'Dogs',
    imageUrl: categoryStripIconStorageKey('dog'),
    href: '/products?petType=dog',
    position: 1,
    isActive: true,
  },
  {
    id: 'fallback-cats',
    label: 'Cats',
    imageUrl: categoryStripIconStorageKey('cat'),
    href: '/products?petType=cat',
    position: 2,
    isActive: true,
  },
  {
    id: 'fallback-birds',
    label: 'Birds',
    imageUrl: categoryStripIconStorageKey('bird'),
    href: '/products?petType=bird',
    position: 3,
    isActive: true,
  },
  {
    id: 'fallback-small',
    label: 'Small animals',
    imageUrl: categoryStripIconStorageKey('rabbit'),
    href: '/products?petType=small-animal',
    position: 4,
    isActive: true,
  },
];
