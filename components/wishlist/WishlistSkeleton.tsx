/**
 * Loading skeleton for the wishlist grid (Suspense / pending states).
 */
export function WishlistSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`wishlist-skel-${i}`}
          className="flex animate-pulse flex-col gap-3 rounded-xl border border-warm-200 bg-surface-card p-4"
        >
          <div className="aspect-square rounded-lg bg-warm-200" />
          <div className="h-4 w-3/4 rounded bg-warm-200" />
          <div className="h-4 w-1/3 rounded bg-warm-200" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 flex-1 rounded-lg bg-warm-200" />
            <div className="h-10 w-24 rounded-lg bg-warm-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
