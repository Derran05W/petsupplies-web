export function ReviewSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading reviews"
      className="mt-16 border-t border-line pt-12"
    >
      <div className="mx-auto max-w-wrap animate-pulse">
        <div className="mb-4 h-3 w-24 rounded bg-panel" />
        <div className="h-9 w-56 rounded-tile bg-panel" />
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="h-72 w-full rounded-card bg-panel lg:max-w-sm" />
          <div className="min-w-0 flex-1 space-y-6">
            <div className="h-10 w-full rounded-tile bg-panel md:w-64" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 border-t border-line py-5">
                <div className="h-4 w-40 rounded bg-panel" />
                <div className="h-3 w-full rounded bg-panel" />
                <div className="h-3 max-w-xl rounded bg-panel" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
