import { safeReturnPath } from '@/lib/navigation/safe-return-path';

/** Where shoppers land after sign-in when no `?redirect=` is present. */
export const DEFAULT_POST_LOGIN_PATH = '/';

export function resolvePostLoginPath(raw: string | null | undefined): string {
  return safeReturnPath(raw) ?? DEFAULT_POST_LOGIN_PATH;
}

/** Preserve a return path when linking between `/login` and `/signup`. */
export function withAuthRedirectQuery(
  path: '/login' | '/signup',
  redirectRaw: string | null | undefined,
): string {
  const target = safeReturnPath(redirectRaw);
  if (!target || target === DEFAULT_POST_LOGIN_PATH) return path;
  return `${path}?redirect=${encodeURIComponent(target)}`;
}
