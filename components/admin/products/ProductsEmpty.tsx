import Link from 'next/link';
import { Package, Plus } from 'lucide-react';

interface ProductsEmptyProps {
  /** When `true`, the empty state shows the "no results for filters"
   * variant instead of the cold-start "create your first" variant. */
  filtered?: boolean;
}

export function ProductsEmpty({ filtered = false }: ProductsEmptyProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-paper px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-tile bg-tile-sage text-tile-sage-ink"
      >
        <Package size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          {filtered ? 'No products match those filters' : 'No products yet'}
        </h2>
        <p className="max-w-md font-body text-sm leading-body text-ink-secondary">
          {filtered
            ? 'Try clearing the search box or switching the stock filter back to “All”.'
            : 'Add your first product to start showing it on the storefront.'}
        </p>
      </div>
      {!filtered && (
        <Link
          href="/admin/products/new"
          className="mt-2 inline-flex items-center gap-2 rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          <Plus size={14} aria-hidden />
          Create your first product
        </Link>
      )}
    </section>
  );
}
