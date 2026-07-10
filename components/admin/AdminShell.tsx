import type { User } from '@supabase/supabase-js';
import { AdminBackLink } from './AdminBackLink';
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
    <div className="flex min-h-svh flex-col bg-paper text-ink">
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-6 pb-10 pt-8 md:px-8 lg:px-12 lg:pb-14 lg:pt-10">
        <div className="relative sticky top-0 z-20 -mx-6 mb-6 shrink-0 px-6 py-3 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
          <div
            aria-hidden
            className="bg-paper/95 pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen max-w-[100vw] -translate-x-1/2 border-b border-line backdrop-blur-sm"
          />
          <AdminBackLink className="relative self-start" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-10 lg:flex-row lg:gap-10">
          <AdminSidebar user={user} />
          <main className="min-w-0 max-w-full flex-1 overflow-x-auto pb-16 lg:pb-0">
            {children}
          </main>
        </div>
      </div>
      <AdminBottomTabs />
    </div>
  );
}
