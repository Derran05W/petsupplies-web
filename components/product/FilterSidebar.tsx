'use client';

import { FilterControls } from './FilterControls';

/**
 * Desktop filter sidebar — hidden below `lg`. Sticky alongside the grid so
 * filters stay visible while the user scrolls product results.
 */
export function FilterSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-24">
        <h2 className="mb-5 font-display text-xl tracking-[-0.02em] text-warm-900">
          Filters
        </h2>
        <FilterControls />
      </div>
    </aside>
  );
}
