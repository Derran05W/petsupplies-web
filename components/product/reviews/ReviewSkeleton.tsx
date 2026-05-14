export function ReviewSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading reviews"
      className="mt-16 border-t border-warm-200 pt-12"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-9 w-56 rounded-lg bg-warm-100" />
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="h-72 w-full rounded-xl bg-warm-100 lg:max-w-sm" />
          <div className="min-w-0 flex-1 space-y-6">
            <div className="h-10 w-full rounded-lg bg-warm-100 md:w-64" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-warm-100 p-5"
              >
                <div className="h-4 w-40 rounded bg-warm-100" />
                <div className="h-3 w-full rounded bg-warm-100" />
                <div className="h-3 max-w-xl rounded bg-warm-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
