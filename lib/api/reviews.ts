import {
  type ApiReview,
  type ApiReviewListResponse,
  type Review,
  type ReviewCreateInput,
  type ReviewListResponse,
  type ReviewSort,
  type StarRating,
} from '@/types/review';
import { firstNameFromLabel } from '@/lib/reviews/display-name';
import { ApiError, apiFetch } from './client';

const EMPTY_REVIEW_LIST: ReviewListResponse = {
  reviews: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

function toIsoDate(value: string | Date): string {
  return typeof value === 'string' ? value : value.toISOString();
}

function mapApiReview(raw: ApiReview): Review {
  return {
    id: raw.id,
    productId: raw.productId,
    userId: raw.userId,
    displayName:
      typeof raw.displayName === 'string' && raw.displayName.trim().length > 0
        ? firstNameFromLabel(raw.displayName)
        : 'Customer',
    rating: raw.rating as StarRating,
    title: raw.title ?? undefined,
    body: raw.body,
    verifiedPurchase: raw.verified,
    createdAt: toIsoDate(raw.createdAt),
  };
}

/** Map petsupplies-api paginated envelope → storefront `ReviewListResponse`. */
export function mapApiReviewListResponse(
  raw: ApiReviewListResponse,
): ReviewListResponse {
  const reviews = Array.isArray(raw.data) ? raw.data.map(mapApiReview) : [];
  const page = raw.page ?? 1;
  const pageSize = raw.limit ?? 10;
  const total = raw.total ?? reviews.length;
  const totalPages = Math.max(1, raw.totalPages ?? 1);

  return {
    reviews,
    total,
    page,
    pageSize,
    totalPages,
    summary: undefined,
  };
}

function normalizeReviewListPayload(raw: unknown): ReviewListResponse {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_REVIEW_LIST };
  }

  const payload = raw as Record<string, unknown>;

  if (Array.isArray(payload.data)) {
    return mapApiReviewListResponse(raw as ApiReviewListResponse);
  }

  if (Array.isArray(payload.reviews)) {
    const legacy = raw as ReviewListResponse;
    return {
      reviews: legacy.reviews ?? [],
      total: legacy.total ?? 0,
      page: legacy.page ?? 1,
      pageSize: legacy.pageSize ?? 10,
      totalPages: Math.max(1, legacy.totalPages ?? 1),
      summary: legacy.summary,
    };
  }

  return { ...EMPTY_REVIEW_LIST };
}

/** Deterministic SSR payload when Playwright runs against Next dev — server-side fetch cannot be routed by Playwright. Never enable outside controlled e2e. */
const E2E_REVIEWS_FIXTURE_DATA: ReviewListResponse = {
  reviews: [
    {
      id: 'e2e-rev-verified',
      productId: 'e2e-product',
      userId: 'e2e-user',
      displayName: 'Taylor',
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
  const limit = opts.pageSize ?? 10;
  const sort = opts.sort ?? 'newest';
  params.set('page', String(page));
  params.set('limit', String(limit));
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
  const raw = await apiFetch<ApiReviewListResponse | ReviewListResponse>(path, {
    cache: 'no-store',
    accessToken: opts.accessToken,
  });
  return normalizeReviewListPayload(raw);
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

  const created = await apiFetch<ApiReview | Review>(
    `/products/${encodeURIComponent(slug)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      accessToken: init.accessToken,
    },
  );
  if (created && typeof created === 'object' && 'verified' in created) {
    return mapApiReview(created as ApiReview);
  }
  return created as Review;
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
