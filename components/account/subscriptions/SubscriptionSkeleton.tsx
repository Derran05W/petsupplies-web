/**
 * Lightweight loading skeleton for subscriptions list tiles.
 */
export function SubscriptionSkeleton() {
  return (
    <ul className="flex flex-col gap-4" aria-hidden>
      {[0, 1].map((k) => (
        <li
          key={k}
          className="flex animate-pulse gap-4 rounded-card border border-line bg-paper p-4"
        >
          <div className="size-24 shrink-0 rounded-tile bg-panel" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-6 w-2/3 rounded-tile bg-panel" />
            <div className="h-4 w-40 rounded-tile bg-panel" />
            <div className="h-4 w-52 rounded-tile bg-panel" />
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-pill bg-panel" />
              <div className="h-9 w-20 rounded-pill bg-panel" />
              <div className="h-9 w-28 rounded-pill bg-panel" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
