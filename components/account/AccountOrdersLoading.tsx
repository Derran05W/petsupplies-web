/**
 * Skeleton for the account orders list while data streams in.
 */
export function AccountOrdersLoading() {
  return (
    <div
      className="flex flex-col divide-y divide-line border-y border-line"
      role="status"
      aria-busy="true"
      aria-label="Loading orders"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="py-4 sm:py-5">
          <div className="h-[3.25rem] animate-pulse rounded-tile bg-panel" />
        </div>
      ))}
    </div>
  );
}
