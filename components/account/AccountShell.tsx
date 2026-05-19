import type { User } from '@supabase/supabase-js';
import { AccountBackLink } from './AccountBackLink';
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
    <div className="flex min-h-svh flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-10 pt-8 md:px-8 lg:px-12 lg:pb-14 lg:pt-10">
        <div className="border-warm-200/80 bg-warm-50/95 sticky top-0 z-20 -mx-6 mb-6 border-b px-6 py-3 backdrop-blur-sm md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
          <AccountBackLink className="self-start" />
        </div>
        <div className="flex flex-1 flex-col gap-10 lg:flex-row lg:gap-10">
          <AccountSidebar user={user} />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        </div>
      </div>
      <AccountBottomTabs />
    </div>
  );
}
