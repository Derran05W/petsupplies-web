import type { User } from '@supabase/supabase-js';
import { userHasAdminRole } from '@/lib/account/admin-role';

export function getAccountDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | null;
  const name = meta?.['name'];
  if (typeof name === 'string' && name.trim().length > 0) return name.trim();
  const fullName = meta?.['full_name'];
  if (typeof fullName === 'string' && fullName.trim().length > 0) {
    return fullName.trim();
  }
  return user.email ?? 'Account';
}

export function getAccountInitial(displayName: string): string {
  const trimmed = displayName.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

export function isAdminUser(user: User | null): boolean {
  return userHasAdminRole(user);
}
