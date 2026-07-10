/**
 * Skeleton for the PDP hero — matches `ProductDetail` grid layout.
 */
export function ProductDetailSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading product"
      className="bg-paper px-gutter pb-16 pt-8 text-ink md:pt-12"
    >
      <div className="mx-auto max-w-wrap animate-pulse">
        <div className="mb-6 h-4 w-40 rounded bg-panel" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="aspect-square rounded-tile bg-panel" />
          <div className="flex flex-col gap-5">
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-tag bg-panel" />
              <div className="h-4 w-20 rounded bg-panel" />
            </div>
            <div className="h-12 w-full max-w-lg rounded-tile bg-panel" />
            <div className="h-8 w-32 rounded-tile bg-panel" />
            <div className="h-10 w-28 rounded bg-panel" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-panel" />
              <div className="h-4 w-full rounded bg-panel" />
              <div className="h-4 w-4/5 rounded bg-panel" />
            </div>
            <div className="h-24 rounded-card bg-panel" />
            <div className="h-10 w-36 rounded-pill bg-panel" />
          </div>
        </div>
      </div>
    </article>
  );
}
