import { Suspense } from 'react';
import { ApiError } from '@/lib/api/client';
import { getProductBySlug } from '@/lib/api/products';
import { listProductReviews } from '@/lib/api/reviews';
import { accountFirstNameFromUser } from '@/lib/reviews/display-name';
import { getServerUser } from '@/lib/supabase/server-user';
import { clampReviewPage } from '@/lib/utils/searchParams';
import type { ReviewSort } from '@/types/review';
import { ReviewSummary } from './ReviewSummary';
import { ReviewForm } from './ReviewForm';
import { ReviewsToolbar } from './ReviewsToolbar';
import { ReviewList } from './ReviewList';
import { ReviewsEmpty } from './ReviewsEmpty';
import { ReviewsUnavailable } from './ReviewsUnavailable';

function ReviewsToolbarFallback() {
  return (
    <div className="h-10 max-w-full animate-pulse rounded-tile bg-panel sm:max-w-md" />
  );
}

interface ReviewsSectionProps {
  slug: string;
  page: number;
  sort: ReviewSort;
}

export async function ReviewsSection({
  slug,
  page,
  sort,
}: ReviewsSectionProps) {
  const product = await getProductBySlug(slug);
  const productRating = product?.rating;
  const viewer = await getServerUser();
  const viewerUserId = viewer?.id;
  const viewerFirstName = viewer ? accountFirstNameFromUser(viewer) : undefined;

  let data;
  try {
    data = await listProductReviews(slug, { page, pageSize: 10, sort });
    const displayPage = clampReviewPage(page, data.totalPages);
    if (displayPage !== page) {
      data = await listProductReviews(slug, {
        page: displayPage,
        pageSize: 10,
        sort,
      });
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return <ReviewsUnavailable />;
    }
    throw err;
  }

  const viewerReview =
    viewerUserId != null
      ? data.reviews.find((r) => r.userId === viewerUserId)
      : undefined;

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="mt-16 scroll-mt-24 border-t border-line pt-12"
    >
      <div className="mx-auto max-w-wrap">
        <p className="mb-4 font-body text-kicker uppercase text-pine">
          Reviews
        </p>
        <h2 id="reviews-heading" className="font-display text-display text-ink">
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
              <ReviewForm
                slug={slug}
                existingReview={viewerReview}
                viewerFirstName={viewerFirstName}
              />
            </aside>

            <div className="min-w-0 flex-1 space-y-6">
              <Suspense fallback={<ReviewsToolbarFallback />}>
                <ReviewsToolbar
                  page={data.page}
                  totalPages={data.totalPages}
                  sort={sort}
                />
              </Suspense>
              {(data.reviews?.length ?? 0) === 0 ? (
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
