export function ReviewsUnavailable() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-unavailable-heading"
      className="mt-16 scroll-mt-24 border-t border-line pt-12"
    >
      <div className="mx-auto max-w-wrap rounded-card bg-panel px-6 py-12 text-center">
        <h2
          id="reviews-unavailable-heading"
          className="font-display text-2xl text-ink"
        >
          Reviews are temporarily unavailable
        </h2>
        <p className="mx-auto mt-3 max-w-md font-body text-sm leading-body text-ink-secondary">
          We couldn&apos;t load reviews right now. Refresh the page or try again
          in a moment.
        </p>
      </div>
    </section>
  );
}
