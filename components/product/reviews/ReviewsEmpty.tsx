import { ReviewsSignInCta } from './ReviewsSignInCta';

interface ReviewsEmptyProps {
  slug: string;
}

export function ReviewsEmpty({ slug }: ReviewsEmptyProps) {
  return (
    <div className="rounded-xl border border-warm-200 bg-warm-100 px-6 py-12 text-center">
      <h3 className="font-display text-xl tracking-[-0.02em] text-warm-900">
        No reviews yet
      </h3>
      <p className="mx-auto mt-2 max-w-md font-body text-sm text-warm-600">
        Be the first to share how this product worked for your pet.
      </p>
      <ReviewsSignInCta slug={slug} />
    </div>
  );
}
