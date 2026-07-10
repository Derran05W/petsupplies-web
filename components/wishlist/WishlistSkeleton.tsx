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
          className="flex animate-pulse flex-col gap-3 rounded-card border border-line bg-paper p-4"
        >
          <div className="aspect-square rounded-tile bg-panel" />
          <div className="h-4 w-3/4 rounded-tag bg-panel" />
          <div className="h-4 w-1/3 rounded-tag bg-panel" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 flex-1 rounded-pill bg-panel" />
            <div className="h-10 w-24 rounded-pill bg-panel" />
          </div>
        </div>
      ))}
    </div>
  );
}
