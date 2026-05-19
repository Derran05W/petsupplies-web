import Link from 'next/link';
import { type Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyHref?: string;
}

/**
 * Responsive product grid. Mobile = 1 col, tablet = 2 cols, desktop = 3 cols.
 * Renders an empty-state panel (warm-100 background, Fraunces heading,
 * "Clear filters" CTA) when `products` is empty.
 */
export function ProductGrid({
  products,
  emptyHref = '/products',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-warm-200 bg-warm-100 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-surface-card text-2xl">
          <span aria-hidden>🐾</span>
        </div>
        <h2 className="font-display text-2xl tracking-[-0.02em] text-warm-900">
          Nothing found yet.
        </h2>
        <p className="max-w-md font-body text-sm text-warm-600">
          We couldn&apos;t find any products that match these filters. Try
          loosening up the search, or clear all filters to start over.
        </p>
        <Link
          href={emptyHref}
          className="rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm text-white transition-colors hover:bg-brand-500"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
