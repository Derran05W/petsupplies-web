/**
 * Skeleton for the account orders list while data streams in.
 */
export function AccountOrdersLoading() {
  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-busy="true"
      aria-label="Loading orders"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="h-[5.5rem] animate-pulse rounded-2xl border border-warm-200 bg-warm-100"
        />
      ))}
    </div>
  );
}
