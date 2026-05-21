import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  classifyReviewMutationError,
  createProductReview,
  listProductReviews,
  mapApiReviewListResponse,
} from '@/lib/api/reviews';
import type { ApiReviewListResponse } from '@/types/review';
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
      sort: 'oldest',
    });

    expect(result.reviews).toHaveLength(payload.reviews.length);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/products/omega-crunch/reviews?page=2&limit=10&sort=oldest',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('maps API paginated envelope (data + limit) to ReviewListResponse', async () => {
    const apiPayload: ApiReviewListResponse = {
      data: [
        {
          id: 'rev-api-1',
          productId: 'prod-1',
          userId: 'user-1',
          rating: 5,
          title: 'Nice',
          body: 'Works great for our dog.',
          verified: true,
          createdAt: '2026-03-01T12:00:00.000Z',
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(apiPayload, { status: 200 })),
    );

    const result = await listProductReviews('omega-crunch');

    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0]?.verifiedPurchase).toBe(true);
    expect(result.reviews[0]?.displayName).toBe('Customer');
  });

  it('maps API displayName when provided', async () => {
    const apiPayload = {
      data: [
        {
          id: 'rev-api-2',
          productId: 'prod-1',
          userId: 'user-1',
          displayName: 'Sam K.', // API may send full label; mapper keeps first name
          rating: 4,
          title: null,
          body: 'Good stuff.',
          verified: true,
          createdAt: '2026-03-01T12:00:00.000Z',
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(apiPayload, { status: 200 })),
    );

    const result = await listProductReviews('omega-crunch');
    expect(result.reviews[0]?.displayName).toBe('Sam');
    expect(result.pageSize).toBe(10);
  });

  it('mapApiReviewListResponse returns empty reviews for missing data', () => {
    const mapped = mapApiReviewListResponse({
      data: undefined as unknown as ApiReviewListResponse['data'],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    });
    expect(mapped.reviews).toEqual([]);
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
