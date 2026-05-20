import { cache } from 'react';
import { createClient } from './server';

/**
 * Read the current Supabase access token from the request-scoped server
 * client. Returns `undefined` when the user is signed out OR when the
 * session has expired and refresh hasn't completed yet.
 *
 * The token is short-lived and Supabase owns refresh — never persist it
 * into any client-visible store. This helper is the canonical
 * server-side read for `lib/api/*` callers that need to attach
 * `Authorization: Bearer <token>` on backend requests.
 *
 * Wrapped in `cache()` so parallel Suspense boundaries on one request
 * share a single session read.
 */
export const getServerAccessToken = cache(
  async (): Promise<string | undefined> => {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        '[getServerAccessToken] no session access_token — admin API calls may return 401',
      );
    }
    return token;
  },
);
