import type { User } from '@supabase/supabase-js';
import { AdminSidebar } from './AdminSidebar';
import { AdminBottomTabs } from './AdminBottomTabs';

interface AdminShellProps {
  user: User;
  children: React.ReactNode;
}

/**
 * Server-rendered chrome for every `/admin/*` page. Same composition as
 * `<AccountShell />`: desktop sidebar at `lg:`, sticky bottom-tab nav
 * below `lg:`. Each page renders its own admin banner + heading via
 * the existing `<PageHeader />` (no fork).
 */
export function AdminShell({ user, children }: AdminShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-warm-50">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 md:px-8 lg:flex-row lg:gap-10 lg:px-12 lg:py-14">
        <AdminSidebar user={user} />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      </div>
      <AdminBottomTabs />
    </div>
  );
}
