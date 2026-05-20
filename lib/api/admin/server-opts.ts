import { getServerAccessToken } from '@/lib/supabase/access-token';

/** Bearer opts for server-side admin API calls (deduped per request). */
export async function getAdminApiOpts() {
  const accessToken = await getServerAccessToken();
  return accessToken ? { accessToken } : {};
}
