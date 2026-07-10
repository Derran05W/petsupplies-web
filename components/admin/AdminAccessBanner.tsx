import Link from 'next/link';
import { probeAdminApiAccess } from '@/lib/api/admin/access-probe';

export async function AdminAccessBanner() {
  const status = await probeAdminApiAccess();

  if (status === 'ok') return null;

  const copy =
    status === 'forbidden'
      ? {
          title: 'Admin API access is not configured',
          body: 'Your Supabase account can open this console, but the API database has not granted admin access yet. Follow docs/admin-access.md, then sign out and sign in.',
        }
      : status === 'unauthorized'
        ? {
            title: 'Session could not reach the API',
            body: 'Sign out and sign in again. If this persists, check NEXT_PUBLIC_API_URL and that petsupplies-api has the correct SUPABASE_JWT_SECRET.',
          }
        : {
            title: 'Cannot reach petsupplies-api',
            body: 'Start the API locally on port 3001 or set NEXT_PUBLIC_API_URL to your deployed API URL, then restart next dev.',
          };

  return (
    <div
      role="alert"
      className="mb-6 rounded-card border border-l-2 border-line border-l-amber bg-panel px-5 py-4 font-body text-sm text-ink"
    >
      <p className="font-medium">{copy.title}</p>
      <p className="mt-1 text-ink-secondary">{copy.body}</p>
      {status === 'forbidden' ? (
        <p className="mt-2 text-ink-muted">
          <Link
            href="/admin"
            className="underline underline-offset-2 transition-colors duration-fast hover:text-ink"
          >
            Retry after setup
          </Link>
          {' · Runbook: '}
          <code className="text-xs">docs/admin-access.md</code>
        </p>
      ) : null}
    </div>
  );
}
