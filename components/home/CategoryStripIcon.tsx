import {
  categoryStripIcon,
  resolveCategoryStripIconKey,
} from '@/lib/site/category-strip-icons';
import type { CategoryStripItem } from '@/types/site';

interface CategoryStripIconProps {
  item: Pick<CategoryStripItem, 'label' | 'href' | 'imageUrl'>;
}

export function CategoryStripIcon({ item }: CategoryStripIconProps) {
  const Icon = categoryStripIcon(resolveCategoryStripIconKey(item));

  return (
    <span
      aria-hidden
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600"
    >
      <Icon size={15} strokeWidth={2} />
    </span>
  );
}
