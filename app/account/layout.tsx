import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AccountShell } from '@/components/account/AccountShell';

/**
 * Account-area layout. Middleware (`/account/*`) already enforces auth
 * — this layout fetches the user once for the chrome (sidebar avatar +
 * name + email) and defensively redirects on the off-chance the matcher
 * is bypassed in a future refactor. The user is intentionally NOT
 * prop-drilled to children: pages that need it call `createClient()`
 * again, which is request-scoped and shares the same cookies.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  return <AccountShell user={user}>{children}</AccountShell>;
}
