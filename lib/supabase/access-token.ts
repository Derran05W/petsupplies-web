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
    return session?.access_token;
  },
);
