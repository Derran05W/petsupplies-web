'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SORT_LABEL, type ProductSort } from '@/types/product';

const SORT_OPTIONS: ProductSort[] = [
  'relevance',
  'price_asc',
  'price_desc',
  'newest',
];

/**
 * Native `<select>` for sort state. Native is the right choice here:
 *   - SSR-safe (no flicker between server-rendered HTML and hydrated state),
 *   - free keyboard / screen reader / mobile picker behaviour,
 *   - no portal hydration issues with react-aria-style menus.
 */
export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get('sort') ?? 'relevance') as ProductSort;

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'relevance') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs.length > 0 ? `/products?${qs}` : '/products', {
      scroll: false,
    });
  };

  return (
    <label className="inline-flex items-center gap-3 font-body text-micro uppercase text-ink-muted">
      <span>Sort</span>
      <select
        value={current}
        onChange={(event) => handleChange(event.target.value)}
        className="cursor-pointer rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm normal-case tracking-normal text-ink focus:border-ink focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABEL[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
