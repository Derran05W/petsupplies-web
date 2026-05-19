/**
 * Lightweight loading skeleton for subscriptions list tiles.
 */
export function SubscriptionSkeleton() {
  return (
    <ul className="flex flex-col gap-4" aria-hidden>
      {[0, 1].map((k) => (
        <li
          key={k}
          className="flex animate-pulse gap-4 rounded-2xl border border-warm-200 bg-surface-card p-4"
        >
          <div className="size-24 shrink-0 rounded-lg bg-warm-100" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-6 w-2/3 rounded bg-warm-100" />
            <div className="h-4 w-40 rounded bg-warm-50" />
            <div className="h-4 w-52 rounded bg-warm-50" />
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-lg bg-warm-100" />
              <div className="h-9 w-20 rounded-lg bg-warm-100" />
              <div className="h-9 w-28 rounded-lg bg-warm-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
