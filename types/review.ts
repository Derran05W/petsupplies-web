/**
 * Review types — mirrors petsupplies-api Phase 13 review payloads.
 * Adjust field names here if the backend contract differs.
 */

/** Matches petsupplies-api `GET /products/:slug/reviews` sort query. */
export type ReviewSort = 'newest' | 'oldest' | 'rating_desc' | 'rating_asc';

export type StarRating = 1 | 2 | 3 | 4 | 5;

/** Raw review row from petsupplies-api list/detail endpoints. */
export interface ApiReview {
  id: string;
  productId: string;
  userId: string;
  displayName?: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Paginated list from `GET /products/:slug/reviews`. */
export interface ApiReviewListResponse {
  data: ApiReview[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Normalized list shape used by PDP review UI. */
export interface Review {
  id: string;
  productId: string;
  userId: string;
  displayName: string;
  rating: StarRating;
  title?: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface RatingBreakdown {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface ReviewSummaryStats {
  avg: number;
  count: number;
  breakdown?: RatingBreakdown;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: ReviewSummaryStats;
}

export interface ReviewCreateInput {
  rating: StarRating;
  title?: string;
  body: string;
}
