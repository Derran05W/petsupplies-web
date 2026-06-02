import { createClient } from '@/lib/supabase/client';

/** Read Supabase access token in browser client components / hooks. */
export async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}
