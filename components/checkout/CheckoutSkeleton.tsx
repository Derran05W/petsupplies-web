/**
 * Pre-hydration skeleton for `/checkout`. The cart store reads from
 * `localStorage` which doesn't exist on the server, so we render this in
 * place of the form/summary until `useCartHasHydrated()` flips true.
 * Heights roughly match the rendered form so there's no perceptible
 * layout shift when the real UI swaps in.
 */
export function CheckoutSkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-6 rounded-2xl border border-warm-200 bg-white p-6">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-warm-100" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-warm-100" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-3 w-32 animate-pulse rounded bg-warm-100" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-warm-100" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-warm-100" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 w-full animate-pulse rounded-lg bg-warm-100" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-warm-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 w-full animate-pulse rounded-lg bg-warm-100" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-warm-100" />
          </div>
        </div>
        <div className="h-12 w-full animate-pulse rounded-lg bg-warm-100" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-warm-200 bg-white" />
    </div>
  );
}
