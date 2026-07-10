interface ReviewsEmptyProps {
  slug: string;
}

export function ReviewsEmpty({ slug: _slug }: ReviewsEmptyProps) {
  return (
    <div className="rounded-card bg-panel px-6 py-12 text-center">
      <h3 className="font-display text-2xl text-ink">No reviews yet</h3>
      <p className="mx-auto mt-2 max-w-md font-body text-sm leading-body text-ink-secondary">
        Be the first to share how this product worked for your pet — use the
        form to post a review linked to your account.
      </p>
    </div>
  );
}
