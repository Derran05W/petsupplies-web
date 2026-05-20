import { AdminRouteLoadingSkeleton } from '@/components/admin/AdminLoadingSkeletons';

/**
 * Instant feedback while an `/admin/*` page streams in. Layout chrome
 * (sidebar / tabs) stays mounted; this replaces only the main column.
 */
export default function AdminLoading() {
  return <AdminRouteLoadingSkeleton />;
}
