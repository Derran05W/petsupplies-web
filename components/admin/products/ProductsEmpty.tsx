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
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-warm-300 bg-white px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-full bg-warm-100 text-warm-600"
      >
        <Package size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
          {filtered ? 'No products match those filters' : 'No products yet'}
        </h2>
        <p className="max-w-md font-body text-sm text-warm-600">
          {filtered
            ? 'Try clearing the search box or switching the stock filter back to “All”.'
            : 'Add your first product to start showing it on the storefront.'}
        </p>
      </div>
      {!filtered && (
        <Link
          href="/admin/products/new"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
        >
          <Plus size={14} aria-hidden />
          Create your first product
        </Link>
      )}
    </section>
  );
}
