import {
  Bird,
  Cat,
  Dog,
  Fish,
  LayoutGrid,
  PawPrint,
  Rabbit,
  Turtle,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryStripItem } from '@/types/site';

/** Stored in API `imageUrl` when the item uses an icon instead of a photo. */
export const CATEGORY_STRIP_ICON_PREFIX = 'icon:';

const CATEGORY_STRIP_ICONS: Record<string, LucideIcon> = {
  'layout-grid': LayoutGrid,
  dog: Dog,
  cat: Cat,
  fish: Fish,
  bird: Bird,
  rabbit: Rabbit,
  turtle: Turtle,
  'paw-print': PawPrint,
};

export const CATEGORY_STRIP_ICON_OPTIONS = [
  { value: 'layout-grid', label: 'Grid (all products)' },
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'fish', label: 'Fish' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit / small pet' },
  { value: 'turtle', label: 'Turtle / reptile' },
  { value: 'paw-print', label: 'Paw (generic)' },
] as const;

export type CategoryStripIconKey =
  (typeof CATEGORY_STRIP_ICON_OPTIONS)[number]['value'];

export function categoryStripIconStorageKey(
  iconKey: CategoryStripIconKey | string,
): string {
  return `${CATEGORY_STRIP_ICON_PREFIX}${iconKey}`;
}

export function categoryStripIconKeyFromStorage(
  imageUrl: string | null | undefined,
): CategoryStripIconKey | null {
  if (!imageUrl?.startsWith(CATEGORY_STRIP_ICON_PREFIX)) return null;
  const key = imageUrl.slice(CATEGORY_STRIP_ICON_PREFIX.length);
  return isCategoryStripIconKey(key) ? key : null;
}

function isCategoryStripIconKey(key: string): key is CategoryStripIconKey {
  return key in CATEGORY_STRIP_ICONS;
}

function iconFromHref(href: string): CategoryStripIconKey | null {
  try {
    const url = new URL(href, 'http://local');
    const category = url.searchParams.get('category')?.toLowerCase();
    if (category === 'dog') return 'dog';
    if (category === 'cat') return 'cat';
    if (category === 'fish') return 'fish';
    if (category === 'bird') return 'bird';

    const petType = url.searchParams.get('petType')?.toLowerCase();
    if (petType?.includes('dog')) return 'dog';
    if (petType?.includes('cat')) return 'cat';
    if (petType?.includes('fish')) return 'fish';
    if (petType?.includes('bird')) return 'bird';
    if (petType?.includes('small')) return 'rabbit';
  } catch {
    // Relative paths without valid URL structure fall through to label matching.
  }
  return null;
}

function iconFromLabel(label: string): CategoryStripIconKey | null {
  const normalized = label.trim().toLowerCase();
  if (normalized === 'all' || normalized === 'all products')
    return 'layout-grid';
  if (/\bdogs?\b/.test(normalized)) return 'dog';
  if (/\bcats?\b/.test(normalized)) return 'cat';
  if (/\bfish\b/.test(normalized)) return 'fish';
  if (/\bbirds?\b/.test(normalized)) return 'bird';
  if (/\bsmall\b|\brabbit/.test(normalized)) return 'rabbit';
  if (/\bturtle|\breptile/.test(normalized)) return 'turtle';
  return null;
}

/** Guess an icon from label/href when legacy rows still have photo paths. */
export function inferCategoryStripIconKey(item: {
  label: string;
  href: string;
}): CategoryStripIconKey {
  if (item.href === '/products' || item.href === '/products/') {
    return 'layout-grid';
  }

  return iconFromHref(item.href) ?? iconFromLabel(item.label) ?? 'paw-print';
}

export function resolveCategoryStripIconKey(
  item: Pick<CategoryStripItem, 'label' | 'href' | 'imageUrl'>,
): CategoryStripIconKey {
  return (
    categoryStripIconKeyFromStorage(item.imageUrl) ??
    inferCategoryStripIconKey(item)
  );
}

export function categoryStripIcon(iconKey: string): LucideIcon {
  return CATEGORY_STRIP_ICONS[iconKey] ?? PawPrint;
}
