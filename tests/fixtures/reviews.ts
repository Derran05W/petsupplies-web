/**
 * Cloned review fixtures for unit tests — keep shapes aligned with
 * `types/review.ts`.
 */
import type {
  Review,
  ReviewListResponse,
  ReviewSummaryStats,
} from '@/types/review';

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function sampleVerifiedReview(): Review {
  return {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-1',
    displayName: 'Sam K.',
    rating: 5,
    title: 'Great food',
    body: 'Our picky eater loves this recipe — shiny coat within two weeks.',
    verifiedPurchase: true,
    createdAt: '2026-03-14T12:00:00.000Z',
  };
}

export function sampleUnverifiedReview(): Review {
  const base = sampleVerifiedReview();
  return {
    ...base,
    id: 'rev-2',
    displayName: 'Alex M.',
    rating: 4,
    verifiedPurchase: false,
    title: undefined,
    body: 'Solid quality and fast shipping. Would buy again.',
  };
}

export function sampleReviewSummary(): ReviewSummaryStats {
  return {
    avg: 4.6,
    count: 127,
    breakdown: { '1': 2, '2': 4, '3': 8, '4': 28, '5': 85 },
  };
}

export function sampleReviewListResponse(
  overrides: Partial<ReviewListResponse> = {},
): ReviewListResponse {
  const reviews = [sampleVerifiedReview(), sampleUnverifiedReview()].map(clone);
  return clone({
    reviews,
    total: reviews.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    summary: sampleReviewSummary(),
    ...overrides,
  });
}

export function emptyReviewListResponse(): ReviewListResponse {
  return clone({
    reviews: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    summary: undefined,
  });
}
