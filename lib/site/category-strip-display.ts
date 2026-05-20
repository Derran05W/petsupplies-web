import type { CategoryStripItem } from '@/types/site';
import { CATEGORY_STRIP_FALLBACK } from '@/lib/site/category-strip-fallbacks';

export function resolveActiveCategoryStripItems(
  items: CategoryStripItem[],
): CategoryStripItem[] {
  const source = items.length > 0 ? items : CATEGORY_STRIP_FALLBACK;
  return source
    .filter((item) => item.isActive)
    .sort((a, b) => a.position - b.position);
}
