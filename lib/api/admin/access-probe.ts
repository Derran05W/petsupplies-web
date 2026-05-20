import { cache } from 'react';
import { ApiError } from '@/lib/api/client';
import { loadAdminAnalyticsOverview } from './analytics-server';

export type AdminAccessStatus =
  | 'ok'
  | 'forbidden'
  | 'unauthorized'
  | 'unreachable';

/**
 * One lightweight admin API check per request (cached). Reuses the same
 * overview fetch as the dashboard when both run on one page.
 */
export const probeAdminApiAccess = cache(
  async (): Promise<AdminAccessStatus> => {
    try {
      await loadAdminAnalyticsOverview();
      return 'ok';
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) return 'forbidden';
        if (err.status === 401) return 'unauthorized';
        if (err.isNetworkError) return 'unreachable';
      }
      return 'ok';
    }
  },
);
