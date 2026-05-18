/** Loading skeleton for `/account/notifications`. */
export function StockAlertSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`skeleton-${String(i)}`}
          className="flex animate-pulse flex-col rounded-xl border border-warm-200 bg-white p-4"
          aria-hidden
        >
          <div className="mb-3 aspect-square rounded-lg bg-warm-100" />
          <div className="h-5 w-3/4 rounded bg-warm-100" />
          <div className="mt-3 h-4 w-1/4 rounded bg-warm-100" />
          <div className="mt-4 h-10 w-full rounded-lg bg-warm-100" />
        </div>
      ))}
    </div>
  );
}
