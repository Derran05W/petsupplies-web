import Link from 'next/link';
import { CategoryStripIcon } from '@/components/home/CategoryStripIcon';
import { fetchCategoryStrip } from '@/lib/api/site/category-strip';
import { resolveActiveCategoryStripItems } from '@/lib/site/category-strip-display';

export async function CategoryStrip() {
  const items = resolveActiveCategoryStripItems(await fetchCategoryStrip());

  return (
    <section
      id="categories"
      aria-label="Shop by pet"
      className="px-6 pb-4 pt-4 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <ul
          className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((item) => (
            <li key={item.id} className="snap-start">
              <Link
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-warm-200 bg-surface-card px-3.5 py-2 font-body text-sm text-warm-900 transition-colors hover:border-warm-300 hover:bg-warm-100"
              >
                <CategoryStripIcon item={item} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
