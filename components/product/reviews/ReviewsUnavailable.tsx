export function ReviewsUnavailable() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-unavailable-heading"
      className="mt-16 scroll-mt-24 border-t border-warm-200 pt-12"
    >
      <div className="mx-auto max-w-7xl rounded-xl border border-warm-200 bg-warm-50 px-6 py-12 text-center">
        <h2
          id="reviews-unavailable-heading"
          className="font-display text-2xl tracking-[-0.02em] text-warm-900"
        >
          Reviews are temporarily unavailable
        </h2>
        <p className="mx-auto mt-3 max-w-md font-body text-sm text-warm-600">
          We couldn&apos;t load reviews right now. Refresh the page or try again
          in a moment.
        </p>
      </div>
    </section>
  );
}
