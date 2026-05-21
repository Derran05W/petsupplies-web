import type { Review } from '@/types/review';
import { formatDate } from '@/lib/utils/format';
import { RatingStars } from './RatingStars';
import { VerifiedPurchaseBadge } from './VerifiedPurchaseBadge';

interface ReviewCardProps {
  review: Review;
  /** True when the signed-in viewer wrote this review. */
  isOwnReview?: boolean;
}

export function ReviewCard({ review, isOwnReview = false }: ReviewCardProps) {
  const formatted = formatDate(review.createdAt);

  return (
    <article
      id={`review-${review.id}`}
      aria-labelledby={`review-${review.id}-title`}
      className="scroll-mt-28 rounded-xl border border-warm-200 bg-surface-card p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-sm font-medium text-warm-900">
            {review.displayName}
          </p>
          {formatted.length > 0 ? (
            <time
              dateTime={review.createdAt}
              className="text-warm-500 font-body text-xs"
            >
              {formatted}
            </time>
          ) : null}
        </div>
        <RatingStars variant="full" value={review.rating} size={14} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isOwnReview ? (
          <span className="rounded-md bg-brand-50 px-2.5 py-1 font-body text-xs font-medium text-brand-700">
            Your review
          </span>
        ) : null}
        {review.verifiedPurchase ? <VerifiedPurchaseBadge /> : null}
      </div>

      {review.title ? (
        <h3
          id={`review-${review.id}-title`}
          className="mt-3 font-display text-lg tracking-[-0.02em] text-warm-900"
        >
          {review.title}
        </h3>
      ) : (
        <span id={`review-${review.id}-title`} className="sr-only">
          Review by {review.displayName}
        </span>
      )}

      <p className="text-warm-700 mt-2 line-clamp-6 whitespace-pre-wrap font-body text-sm leading-relaxed">
        {review.body}
      </p>
    </article>
  );
}
