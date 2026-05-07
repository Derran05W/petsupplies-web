/**
 * Skeleton placeholder that matches `ProductCard`'s outer shape.
 * Pure CSS shimmer using Tailwind's `animate-pulse` — no JS required, so
 * this stays a server component.
 */
export function ProductSkeleton() {
  return (
    <div
      className="flex flex-col rounded-xl border border-warm-200 bg-white p-3"
      aria-hidden
    >
      <div className="aspect-square animate-pulse rounded-lg bg-warm-100" />
      <div className="mt-4 flex flex-col gap-2 px-1 pb-1">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded-md bg-warm-100" />
          <div className="h-3 w-12 animate-pulse rounded bg-warm-100" />
        </div>
        <div className="h-5 w-3/4 animate-pulse rounded bg-warm-100" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-warm-100" />
      </div>
    </div>
  );
}

interface ProductSkeletonGridProps {
  count?: number;
}

export function ProductSkeletonGrid({ count = 9 }: ProductSkeletonGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
