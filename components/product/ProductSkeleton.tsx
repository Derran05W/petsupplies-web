/**
 * Skeleton placeholder matching the boutique `ProductCard` shape — 4:5
 * tile over a name / label / price meta row. Pure CSS shimmer using
 * Tailwind's `animate-pulse`, no JS required, so this stays a server
 * component.
 */
export function ProductSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden>
      <div className="aspect-[4/5] animate-pulse rounded-tile bg-panel" />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-panel" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-panel" />
        </div>
        <div className="h-4 w-12 animate-pulse rounded bg-panel" />
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
      className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-6 gap-y-9"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
