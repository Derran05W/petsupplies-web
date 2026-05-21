import { ProductSkeleton } from './ProductSkeleton';

export function RelatedProductsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading related products"
      className="mt-16 border-t border-warm-200 pt-12"
    >
      <div className="mb-8 h-9 w-64 animate-pulse rounded-lg bg-warm-100" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
