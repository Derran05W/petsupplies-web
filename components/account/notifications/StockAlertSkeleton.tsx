/** Loading skeleton for `/account/notifications`. */
export function StockAlertSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`skeleton-${String(i)}`}
          className="flex animate-pulse flex-col rounded-card border border-line bg-paper p-4"
          aria-hidden
        >
          <div className="mb-3 aspect-square rounded-tile bg-panel" />
          <div className="h-5 w-3/4 rounded-tile bg-panel" />
          <div className="mt-3 h-4 w-1/4 rounded-tile bg-panel" />
          <div className="mt-4 h-10 w-full rounded-pill bg-panel" />
        </div>
      ))}
    </div>
  );
}
