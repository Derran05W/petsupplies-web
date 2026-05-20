import { ApiError } from './client';

/**
 * True when petsupplies-api is not reachable or not deployed at the
 * configured base URL (e.g. Railway "Application not found").
 */
export function isBackendUnreachableError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.isNetworkError) return true;
  if (err.status === 502 || err.status === 503 || err.status === 504) {
    return true;
  }
  if (err.status === 404 && /application not found/i.test(err.message)) {
    return true;
  }
  return false;
}
