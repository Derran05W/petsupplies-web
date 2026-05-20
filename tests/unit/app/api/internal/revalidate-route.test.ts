import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const revalidateTag = vi.fn();

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}));

describe('POST /api/internal/revalidate', () => {
  const originalToken = process.env.INTERNAL_REVALIDATE_TOKEN;

  beforeEach(() => {
    revalidateTag.mockClear();
    process.env.INTERNAL_REVALIDATE_TOKEN = 'test-revalidate-token';
  });

  afterEach(() => {
    process.env.INTERNAL_REVALIDATE_TOKEN = originalToken;
  });

  async function post(body: unknown, token?: string) {
    const { POST } = await import('@/app/api/internal/revalidate/route');
    const headers: Record<string, string> = {
      'content-type': 'application/json',
    };
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    return POST(
      new NextRequest('http://localhost:3000/api/internal/revalidate', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }),
    );
  }

  it('returns 401 when the bearer token is missing or wrong', async () => {
    const missing = await post({ tags: ['site-settings'] });
    expect(missing.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();

    const wrong = await post({ tags: ['site-settings'] }, 'wrong-token');
    expect(wrong.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('returns 204 and revalidates each tag when authorized', async () => {
    const response = await post(
      { tags: ['site-settings', 'site-nav'] },
      'test-revalidate-token',
    );

    expect(response.status).toBe(204);
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith('site-settings');
    expect(revalidateTag).toHaveBeenCalledWith('site-nav');
  });

  it('returns 400 when tags is not an array', async () => {
    const response = await post({}, 'test-revalidate-token');
    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
