import { describe, expect, it } from 'vitest';
import {
  clampReviewPage,
  parseReviewListingParams,
} from '@/lib/utils/searchParams';

describe('parseReviewListingParams', () => {
  it('defaults page to 1 and sort to newest', () => {
    expect(parseReviewListingParams({})).toEqual({
      page: 1,
      sort: 'newest',
    });
  });

  it('parses reviewsPage and reviewsSort when valid', () => {
    expect(
      parseReviewListingParams({
        reviewsPage: '3',
        reviewsSort: 'rating_desc',
      }),
    ).toEqual({ page: 3, sort: 'rating_desc' });
  });

  it('maps legacy recent and helpful to newest', () => {
    expect(parseReviewListingParams({ reviewsSort: 'recent' })).toEqual({
      page: 1,
      sort: 'newest',
    });
    expect(parseReviewListingParams({ reviewsSort: 'helpful' })).toEqual({
      page: 1,
      sort: 'newest',
    });
  });

  it('drops invalid sort and clamps bad page numbers', () => {
    expect(
      parseReviewListingParams({
        reviewsPage: '-2',
        reviewsSort: 'not-real',
      }),
    ).toEqual({ page: 1, sort: 'newest' });
  });
});

describe('clampReviewPage', () => {
  it('clamps to [1, totalPages]', () => {
    expect(clampReviewPage(0, 3)).toBe(1);
    expect(clampReviewPage(99, 3)).toBe(3);
    expect(clampReviewPage(2, 3)).toBe(2);
    expect(clampReviewPage(5, 0)).toBe(1);
  });
});
