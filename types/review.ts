/**
 * Review types — mirrors petsupplies-api Phase 13 review payloads.
 * Adjust field names here if the backend contract differs.
 */

export type ReviewSort = 'recent' | 'helpful' | 'rating_desc' | 'rating_asc';

export type StarRating = 1 | 2 | 3 | 4 | 5;

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
