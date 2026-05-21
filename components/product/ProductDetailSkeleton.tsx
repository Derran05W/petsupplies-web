/**
 * Skeleton for the PDP hero — matches `ProductDetail` grid layout.
 */
export function ProductDetailSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="Loading product"
      className="px-6 pb-16 pt-8 md:px-8 md:pt-12 lg:px-12"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-6 h-4 w-40 rounded bg-warm-100" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
          <div className="aspect-square rounded-xl bg-warm-100" />
          <div className="flex flex-col gap-5">
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-md bg-warm-100" />
              <div className="h-4 w-20 rounded bg-warm-100" />
            </div>
            <div className="h-12 w-full max-w-lg rounded-lg bg-warm-100" />
            <div className="h-8 w-32 rounded-md bg-warm-100" />
            <div className="h-10 w-28 rounded bg-warm-100" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-warm-100" />
              <div className="h-4 w-full rounded bg-warm-100" />
              <div className="h-4 w-4/5 rounded bg-warm-100" />
            </div>
            <div className="h-24 rounded-2xl bg-warm-100" />
            <div className="h-10 w-36 rounded-lg bg-warm-100" />
          </div>
        </div>
      </div>
    </article>
  );
}
