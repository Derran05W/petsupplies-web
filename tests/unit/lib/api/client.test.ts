import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from '@/lib/api/client';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('throws ApiError with isNetworkError when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await expect(apiFetch('/admin/products')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'Could not reach API at http://api.test/admin/products',
    });

    await expect(apiFetch('/admin/products')).rejects.toSatisfy(
      (err: unknown) => err instanceof ApiError && err.isNetworkError,
    );
  });

  it('throws when response is 200 but not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<html></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      ),
    );

    await expect(apiFetch('/health')).rejects.toMatchObject({
      status: 0,
      message: 'API returned non-JSON (text/html) from http://api.test/health',
    });
  });

  it('throws when JSON body cannot be parsed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('{not-json', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await expect(apiFetch('/health')).rejects.toMatchObject({
      status: 0,
      message: 'Failed to parse JSON from http://api.test/health',
    });
  });

  it('parses hono zod-validator 400 bodies into ApiError message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: {
              name: 'ZodError',
              message: JSON.stringify([
                {
                  expected: 'int',
                  code: 'invalid_type',
                  path: ['price'],
                  message: 'Invalid input: expected int, received null',
                },
              ]),
            },
          }),
          {
            status: 400,
            headers: { 'content-type': 'application/json' },
          },
        ),
      ),
    );

    await expect(
      apiFetch('/admin/products/prod-1', { method: 'PATCH', body: '{}' }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'price: Invalid input: expected int, received null',
    });
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await expect(apiFetch<{ status: string }>('/health')).resolves.toEqual({
      status: 'ok',
    });
  });
});
