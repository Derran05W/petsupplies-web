import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  classifyReviewMutationError,
  createProductReview,
  listProductReviews,
} from '@/lib/api/reviews';
import { sampleReviewListResponse } from '@/tests/fixtures/reviews';

describe('lib/api/reviews', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    vi.stubEnv('E2E_REVIEWS_FIXTURE', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GETs paginated reviews for a slug', async () => {
    const payload = sampleReviewListResponse();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(payload, { status: 200 })),
    );

    const result = await listProductReviews('omega-crunch', {
      page: 2,
      pageSize: 10,
      sort: 'helpful',
    });

    expect(result.reviews).toHaveLength(payload.reviews.length);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/products/omega-crunch/reviews?page=2&pageSize=10&sort=helpful',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('POSTs a review with Authorization', async () => {
    const created = sampleReviewListResponse().reviews[0]!;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(created, { status: 201 })),
    );

    await createProductReview(
      'omega-crunch',
      { rating: 5, title: 'Hi', body: 'A'.repeat(25) },
      { accessToken: 'tok-123' },
    );

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/products/omega-crunch/reviews',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer tok-123',
        }),
      }),
    );
  });

  it('classifies duplicate, ineligible, unauthorized, network', () => {
    expect(classifyReviewMutationError(new ApiError('dup', 409)).kind).toBe(
      'duplicate',
    );
    expect(classifyReviewMutationError(new ApiError('nope', 403)).kind).toBe(
      'ineligible',
    );
    expect(classifyReviewMutationError(new ApiError('who', 401)).kind).toBe(
      'unauthorized',
    );
    expect(classifyReviewMutationError(new ApiError('net', 0)).kind).toBe(
      'network',
    );
    expect(
      classifyReviewMutationError(
        new ApiError('exists', 422, { review: ['already_reviewed'] }),
      ).kind,
    ).toBe('duplicate');
  });
});
