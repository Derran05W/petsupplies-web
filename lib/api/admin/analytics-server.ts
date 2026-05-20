import { cache } from 'react';
import { adminAnalyticsOverview } from './analytics';
import { getAdminApiOpts } from './server-opts';

/** Request-scoped cache — safe to call from multiple Suspense children. */
export const loadAdminAnalyticsOverview = cache(async () => {
  return adminAnalyticsOverview(await getAdminApiOpts());
});
