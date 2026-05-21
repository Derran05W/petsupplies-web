import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from './server';

/**
 * Validated Supabase user for the current request (server components).
 * Prefer over `getSession().user`, which is not re-validated.
 */
export const getServerUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Account id shared with petsupplies-api `User.id` (JWT `sub`). */
export async function getServerUserId(): Promise<string | undefined> {
  const user = await getServerUser();
  return user?.id;
}
