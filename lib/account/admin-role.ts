import type { User } from '@supabase/supabase-js';

/**
 * Authoritative admin check for middleware + server layouts.
 * Prefer **app_metadata.role** (user cannot mutate via client updateUser).
 * Temporary fallback: **user_metadata.role** until admins are migrated (SQL in docs).
 */
export function userHasAdminRole(user: User | null): boolean {
  if (!user) return false;

  const appRole = (user.app_metadata as Record<string, unknown> | null)?.[
    'role'
  ];
  if (appRole === 'ADMIN') return true;

  // TODO(security): drop after all ADMIN rows moved to raw_app_meta_data.role.
  const metaRole = (user.user_metadata as Record<string, unknown> | null)?.[
    'role'
  ];
  return metaRole === 'ADMIN';
}
