import { describe, expect, it } from 'vitest';
import { parseReviewListingParams } from '@/lib/utils/searchParams';

describe('parseReviewListingParams', () => {
  it('defaults page to 1 and sort to recent', () => {
    expect(parseReviewListingParams({})).toEqual({
      page: 1,
      sort: 'recent',
    });
  });

  it('parses reviewsPage and reviewsSort when valid', () => {
    expect(
      parseReviewListingParams({
        reviewsPage: '3',
        reviewsSort: 'helpful',
      }),
    ).toEqual({ page: 3, sort: 'helpful' });
  });

  it('drops invalid sort and clamps bad page numbers', () => {
    expect(
      parseReviewListingParams({
        reviewsPage: '-2',
        reviewsSort: 'not-real',
      }),
    ).toEqual({ page: 1, sort: 'recent' });
  });
});
