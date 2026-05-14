import {
  type Review,
  type ReviewCreateInput,
  type ReviewListResponse,
  type ReviewSort,
} from '@/types/review';
import { ApiError, apiFetch } from './client';

/** Deterministic SSR payload when Playwright runs against Next dev — server-side fetch cannot be routed by Playwright. Never enable outside controlled e2e. */
const E2E_REVIEWS_FIXTURE_DATA: ReviewListResponse = {
  reviews: [
    {
      id: 'e2e-rev-verified',
      productId: 'e2e-product',
      userId: 'e2e-user',
      displayName: 'Taylor Verified',
      rating: 5,
      title: 'Bowls cleared nightly',
      body: 'Our picky eater finished every meal — coats look shinier after two weeks.',
      verifiedPurchase: true,
      createdAt: '2026-03-01T12:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  summary: {
    avg: 5,
    count: 1,
    breakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 1 },
  },
};

export interface ListProductReviewsOptions {
  page?: number;
  pageSize?: number;
  sort?: ReviewSort;
  accessToken?: string;
}

function reviewsQuery(opts: ListProductReviewsOptions): string {
  const params = new URLSearchParams();
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const sort = opts.sort ?? 'recent';
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  params.set('sort', sort);
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
}

export async function listProductReviews(
  slug: string,
  opts: ListProductReviewsOptions = {},
): Promise<ReviewListResponse> {
  if (process.env.E2E_REVIEWS_FIXTURE === '1') {
    void slug;
    void opts;
    return structuredClone(E2E_REVIEWS_FIXTURE_DATA);
  }

  const path = `/products/${encodeURIComponent(slug)}/reviews${reviewsQuery(opts)}`;
  return apiFetch<ReviewListResponse>(path, {
    cache: 'no-store',
    accessToken: opts.accessToken,
  });
}

export async function createProductReview(
  slug: string,
  input: ReviewCreateInput,
  init: { accessToken: string },
): Promise<Review> {
  if (process.env.E2E_REVIEWS_FIXTURE === '1') {
    void slug;
    void init;
    const base = E2E_REVIEWS_FIXTURE_DATA.reviews[0]!;
    return structuredClone({
      ...base,
      id: 'e2e-rev-created',
      title: input.title,
      body: input.body,
      rating: input.rating,
    }) as Review;
  }

  return apiFetch<Review>(`/products/${encodeURIComponent(slug)}/reviews`, {
    method: 'POST',
    body: JSON.stringify(input),
    accessToken: init.accessToken,
  });
}

export type ReviewMutationErrorKind =
  | 'duplicate'
  | 'ineligible'
  | 'unauthorized'
  | 'validation'
  | 'network'
  | 'unknown';

export interface ClassifiedReviewError {
  kind: ReviewMutationErrorKind;
  message: string;
}

function hasDuplicateSignal(err: ApiError): boolean {
  if (err.status === 409) return true;
  const reviewErrors = err.validationErrors?.review;
  if (!reviewErrors?.length) return false;
  const joined = reviewErrors.join(' ').toLowerCase();
  return (
    joined.includes('already') ||
    joined.includes('duplicate') ||
    joined.includes('exists')
  );
}

/** Map thrown errors from review mutations into stable UI branches. */
export function classifyReviewMutationError(
  err: unknown,
): ClassifiedReviewError {
  if (err instanceof ApiError) {
    if (err.isNetworkError) {
      return {
        kind: 'network',
        message:
          'We couldn’t reach the server. Check your connection and try again.',
      };
    }
    if (err.status === 401) {
      return {
        kind: 'unauthorized',
        message: 'Your session expired. Sign in again to post a review.',
      };
    }
    if (err.status === 403) {
      return {
        kind: 'ineligible',
        message:
          'Only verified buyers can review this product. Once your order is delivered, you’ll be able to leave a review.',
      };
    }
    if (hasDuplicateSignal(err)) {
      return {
        kind: 'duplicate',
        message: 'You already reviewed this product.',
      };
    }
    if (err.status === 422 && err.validationErrors) {
      return {
        kind: 'validation',
        message: err.message || 'Please fix the highlighted fields.',
      };
    }
    return {
      kind: 'unknown',
      message: err.message || 'Something went wrong. Please try again.',
    };
  }
  return {
    kind: 'unknown',
    message: 'Something went wrong. Please try again.',
  };
}
