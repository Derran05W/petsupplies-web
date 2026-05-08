import type { User } from '@supabase/supabase-js';
import { AccountSidebar } from './AccountSidebar';
import { AccountBottomTabs } from './AccountBottomTabs';

interface AccountShellProps {
  user: User;
  children: React.ReactNode;
}

/**
 * Server-rendered chrome for every `/account/*` page. Composes the
 * desktop sidebar (visible at `lg:` and up) with the main content area
 * and the mobile bottom-tab nav (visible below `lg:`). The chrome is
 * intentionally thin — each page renders its own `<h1>` (Fraunces) via
 * `<PageHeader />`.
 */
export function AccountShell({ user, children }: AccountShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-warm-50">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 md:px-8 lg:flex-row lg:gap-10 lg:px-12 lg:py-14">
        <AccountSidebar user={user} />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      </div>
      <AccountBottomTabs />
    </div>
  );
}
