/** Same-origin proxy path (see next.config.mjs rewrites). */
export const DEV_API_PROXY_PATH = '/api-backend';

const LOOPBACK_API = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/;

export function isLoopbackApiUrl(url: string): boolean {
  return LOOPBACK_API.test(url.replace(/\/$/, ''));
}

/**
 * Base URL for petsupplies-api.
 * - Server / tests: use NEXT_PUBLIC_API_URL or http://localhost:3001
 * - Browser + loopback API URL: same-origin /api-backend (Next rewrite → API, no CORS)
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const fallback = 'http://localhost:3001';

  if (typeof window !== 'undefined') {
    if (
      !configured ||
      configured.length === 0 ||
      isLoopbackApiUrl(configured)
    ) {
      return DEV_API_PROXY_PATH;
    }
    return configured;
  }

  if (!configured || configured.length === 0) {
    return fallback;
  }
  return configured;
}
