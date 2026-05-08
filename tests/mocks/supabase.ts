/**
 * Minimal Supabase browser-client mock. Returns just enough surface
 * area for the consumers we test (`createClient().auth.getSession()`,
 * `signInWithPassword`, `signOut`).
 *
 * Tests that need a different per-call response should construct their
 * own client via `mockSupabaseClient({ session })` and pass it into
 * `vi.mock('@/lib/supabase/client', () => ({ createClient: () =>
 * client }))` from inside the test file. `setupSupabaseClientMock()`
 * is the zero-ceremony shorthand for "I want a signed-in session".
 */
import { vi, type Mock } from 'vitest';

export interface MockSession {
  access_token: string;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

export interface MockSupabaseClientOptions {
  session?: MockSession | null;
}

export interface MockSupabaseClient {
  auth: {
    getSession: Mock;
    signInWithPassword: Mock;
    signOut: Mock;
  };
}

export function mockSupabaseClient(
  options: MockSupabaseClientOptions = {},
): MockSupabaseClient {
  const session = options.session ?? null;
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { session, user: session?.user ?? null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  };
}
