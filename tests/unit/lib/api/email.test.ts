import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EmailMarketingPreferences } from '@/types/types/email';
import {
  getEmailPreferences,
  patchEmailPreferences,
  postEmailUnsubscribe,
} from '@/lib/api/email';

describe('lib/api/email', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('posts JSON token bodies to `/email/unsubscribe`', async () => {
    const fetchMock = vi.fn(
      async () => new Response(null, { status: 204, statusText: 'No Content' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(postEmailUnsubscribe('token-xyz')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/email/unsubscribe',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'token-xyz' }),
      }),
    );
  });

  it('surfaces DNS failures without inventing payloads', async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(postEmailUnsubscribe('token')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
    });

    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => {
      throw new TypeError('Failed to fetch');
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(patchEmailPreferences('token', prefs())).rejects.toMatchObject(
      {
        status: 0,
      },
    );
  });

  it('parses `/email/preferences` responses', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        {
          preferences: prefs(),
        },
        { status: 200 },
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await getEmailPreferences('with space');

    expect(result.preferences.promotional).toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/email/preferences?token=with+space',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('returns validation errors emitted by `/email/preferences`', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { message: 'Invalid token.', errors: { token: ['bad'] } },
          { status: 418, statusText: "I'm a teapot" },
        ),
      ),
    );

    await expect(getEmailPreferences('bad')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid token.',
      status: 418,
      validationErrors: { token: ['bad'] },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { message: 'Validation failed.', errors: { preferences: ['nope'] } },
          { status: 422 },
        ),
      ),
    );

    await expect(patchEmailPreferences('token', prefs())).rejects.toMatchObject(
      {
        name: 'ApiError',
        message: 'Validation failed.',
        validationErrors: { preferences: ['nope'] },
      },
    );
  });

  it('allows PATCH payloads that respond with HTTP 204', async () => {
    const fetchMock = vi.fn(
      async () => new Response(null, { status: 204, statusText: 'No Content' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      patchEmailPreferences('secret', prefs()),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/email/preferences?token=secret',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ preferences: prefs() }),
      }),
    );
  });
});

function prefs(): EmailMarketingPreferences {
  return {
    promotional: true,
    abandonedCart: false,
    backInStock: true,
    orderUpdates: false,
  };
}
