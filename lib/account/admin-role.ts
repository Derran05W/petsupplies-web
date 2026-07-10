import type { User } from '@supabase/supabase-js';

/**
 * Authoritative admin check for middleware + server layouts.
 *
 * ONLY **app_metadata.role === 'ADMIN'** grants admin. `app_metadata` is
 * server-controlled and cannot be mutated by a client `updateUser` call,
 * unlike `user_metadata` (which a signed-in user could set to escalate).
 *
 * The former `user_metadata.role` fallback has been removed. Admin rows must
 * be migrated to `raw_app_meta_data.role` first — run
 * docs/supabase/migrate-admin-role-to-app-metadata.sql BEFORE deploying, or
 * every existing admin loses access.
 */
export function userHasAdminRole(user: User | null): boolean {
  if (!user) return false;

  const appRole = (user.app_metadata as Record<string, unknown> | null)?.[
    'role'
  ];
  return appRole === 'ADMIN';
}
