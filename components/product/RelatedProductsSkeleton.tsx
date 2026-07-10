import { ProductSkeleton } from './ProductSkeleton';

export function RelatedProductsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading related products"
      className="mt-16 border-t border-line pt-12"
    >
      <div className="mb-8 animate-pulse">
        <div className="mb-4 h-3 w-28 rounded bg-panel" />
        <div className="h-9 w-64 rounded-tile bg-panel" />
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
