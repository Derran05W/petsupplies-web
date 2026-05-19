import type { User } from '@supabase/supabase-js';
import { getAccountDisplayName } from '@/lib/account/user-display';
import { AccountNavLinks } from './AccountNavLinks';
import { AccountSignOutButton } from './AccountSignOutButton';

interface AccountSidebarProps {
  user: User;
}

/**
 * Server-rendered desktop sidebar. Visible at `lg:` and up. The header
 * (name + email) renders server-side from the request-scoped Supabase
 * user — no extra round-trip on the client. Active link state lives
 * inside the `<AccountNavLinks />` client island.
 *
 * Sign-out is intentionally only here (not in the bottom-tab nav). Mobile
 * users can still sign out from the global settings drawer.
 */
export function AccountSidebar({ user }: AccountSidebarProps) {
  const name = getAccountDisplayName(user);

  return (
    <aside
      aria-label="Account navigation"
      className="hidden h-fit w-64 shrink-0 flex-col gap-6 rounded-2xl border border-warm-200 bg-surface-card p-5 lg:sticky lg:top-24 lg:flex"
    >
      <div className="border-b border-warm-200 pb-4">
        <p className="truncate font-body text-sm font-medium text-warm-900">
          {name}
        </p>
        {user.email ? (
          <p className="truncate font-body text-xs text-warm-600">
            {user.email}
          </p>
        ) : null}
      </div>

      <nav aria-label="Account">
        <AccountNavLinks />
      </nav>

      <div className="mt-auto border-t border-warm-200 pt-3">
        <AccountSignOutButton />
      </div>
    </aside>
  );
}
