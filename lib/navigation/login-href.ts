import { safeReturnPath } from './safe-return-path';

const AUTH_PATHS = new Set(['/login', '/signup']);

/**
 * Build `/login` with an optional `redirect` back to the current storefront page.
 */
export function buildLoginHref(pathname: string, search = ''): string {
  if (AUTH_PATHS.has(pathname)) {
    return '/login';
  }

  const returnPath = safeReturnPath(
    search.length > 0 ? `${pathname}?${search}` : pathname,
  );
  if (!returnPath || returnPath === '/') {
    return '/login';
  }

  return `/login?redirect=${encodeURIComponent(returnPath)}`;
}
