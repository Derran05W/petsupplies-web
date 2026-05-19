import { redirect } from 'next/navigation';
import { userHasAdminRole } from '@/lib/account/admin-role';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/AdminShell';

/**
 * Admin-area layout. Middleware (`/admin/*`) already enforces auth +
 * `role === 'ADMIN'` — this layout fetches the user once for the
 * sidebar avatar / name strip and defensively redirects on the off-
 * chance the matcher is bypassed in a future refactor. The defensive
 * branch also gets the type-checker on side: every admin page below
 * this layout can rely on the `<AdminShell user>` prop being non-null.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  if (!userHasAdminRole(user)) {
    redirect('/');
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
