'use client';

import { FilterControls } from './FilterControls';

/**
 * Desktop filter sidebar — hidden below `lg`. Sticky alongside the grid so
 * filters stay visible while the user scrolls product results.
 */
export function FilterSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-28">
        <h2 className="mb-6 font-display text-2xl tracking-[-0.01em] text-ink">
          Filters
        </h2>
        <FilterControls />
      </div>
    </aside>
  );
}
