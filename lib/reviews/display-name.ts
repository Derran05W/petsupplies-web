import type { User } from '@supabase/supabase-js';

/** First token of a display label (e.g. "Taylor Verified" → "Taylor"). */
export function firstNameFromLabel(label: string): string {
  const trimmed = label.trim();
  if (trimmed.length === 0) return 'Customer';
  const first = trimmed.split(/\s+/)[0] ?? trimmed;
  return first.length > 0 ? first : 'Customer';
}

/** Full public label from Supabase account metadata. */
export function accountDisplayNameFromUser(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    typeof meta?.full_name === 'string'
      ? meta.full_name
      : typeof meta?.name === 'string'
        ? meta.name
        : '';
  const trimmed = fromMeta.trim();
  if (trimmed.length > 0) return trimmed;
  const local = user.email?.split('@')[0]?.trim();
  return local && local.length > 0 ? local : 'Customer';
}

/** First name only — used when composing and displaying reviews. */
export function accountFirstNameFromUser(user: User): string {
  return firstNameFromLabel(accountDisplayNameFromUser(user));
}
