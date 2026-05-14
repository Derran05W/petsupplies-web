import { Suspense } from 'react';
import { ApiError } from '@/lib/api/client';
import { listProductReviews } from '@/lib/api/reviews';
import type { Rating } from '@/types/product';
import type { ReviewSort } from '@/types/review';
import { ReviewSummary } from './ReviewSummary';
import { ReviewForm } from './ReviewForm';
import { ReviewsToolbar } from './ReviewsToolbar';
import { ReviewList } from './ReviewList';
import { ReviewsEmpty } from './ReviewsEmpty';
import { ReviewsUnavailable } from './ReviewsUnavailable';

function ReviewsToolbarFallback() {
  return (
    <div className="h-10 max-w-full animate-pulse rounded-lg bg-warm-100 sm:max-w-md" />
  );
}

interface ReviewsSectionProps {
  slug: string;
  page: number;
  sort: ReviewSort;
  productRating?: Rating;
}

export async function ReviewsSection({
  slug,
  page,
  sort,
  productRating,
}: ReviewsSectionProps) {
  let data;
  try {
    data = await listProductReviews(slug, { page, pageSize: 10, sort });
  } catch (err) {
    if (err instanceof ApiError && err.isNetworkError) {
      return <ReviewsUnavailable />;
    }
    throw err;
  }

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="mt-16 scroll-mt-24 border-t border-warm-200 pt-12"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          id="reviews-heading"
          className="font-display text-3xl tracking-[-0.02em] text-warm-900"
        >
          Customer reviews
        </h2>

        <div className="mt-8 space-y-8">
          <ReviewSummary
            summary={data.summary}
            productRating={productRating}
            listTotal={data.total}
          />

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <aside className="w-full shrink-0 lg:max-w-sm">
              <ReviewForm slug={slug} />
            </aside>

            <div className="min-w-0 flex-1 space-y-6">
              <Suspense fallback={<ReviewsToolbarFallback />}>
                <ReviewsToolbar
                  page={data.page}
                  totalPages={data.totalPages}
                  sort={sort}
                />
              </Suspense>
              {data.reviews.length === 0 ? (
                <ReviewsEmpty slug={slug} />
              ) : (
                <ReviewList reviews={data.reviews} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
