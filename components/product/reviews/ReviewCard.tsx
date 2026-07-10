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
      className="scroll-mt-28 border-t border-line py-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-sm font-semibold text-ink">
            {review.displayName}
          </p>
          {formatted.length > 0 ? (
            <time
              dateTime={review.createdAt}
              className="font-body text-xs text-ink-faint"
            >
              {formatted}
            </time>
          ) : null}
        </div>
        <RatingStars variant="full" value={review.rating} size={14} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isOwnReview ? (
          <span className="border-slate/40 rounded-tag border bg-tile-slate px-2 py-0.5 font-body text-micro uppercase text-tile-slate-ink">
            Your review
          </span>
        ) : null}
        {review.verifiedPurchase ? <VerifiedPurchaseBadge /> : null}
      </div>

      {review.title ? (
        <h3
          id={`review-${review.id}-title`}
          className="mt-3 font-display text-lg tracking-[-0.01em] text-ink"
        >
          {review.title}
        </h3>
      ) : (
        <span id={`review-${review.id}-title`} className="sr-only">
          Review by {review.displayName}
        </span>
      )}

      <p className="mt-2 line-clamp-6 whitespace-pre-wrap font-body text-sm leading-body text-ink-secondary">
        {review.body}
      </p>
    </article>
  );
}
