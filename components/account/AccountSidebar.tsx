import type { User } from '@supabase/supabase-js';
import { AccountNavLinks } from './AccountNavLinks';
import { AccountSignOutButton } from './AccountSignOutButton';

interface AccountSidebarProps {
  user: User;
}

function getDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | null;
  const name = meta?.['name'];
  if (typeof name === 'string' && name.trim().length > 0) return name.trim();
  return user.email ?? 'Account';
}

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

/**
 * Server-rendered desktop sidebar. Visible at `lg:` and up. The header
 * (avatar + name + email) renders server-side from the request-scoped
 * Supabase user — no extra round-trip on the client. Active link state
 * lives inside the `<AccountNavLinks />` client island.
 *
 * Sign-out is intentionally only here (not in the bottom-tab nav). Mobile
 * users can still sign out via the existing `<AuthSlot />` dropdown in
 * the global navbar.
 */
export function AccountSidebar({ user }: AccountSidebarProps) {
  const name = getDisplayName(user);
  const initial = getInitial(name);

  return (
    <aside
      aria-label="Account navigation"
      className="hidden h-fit w-64 shrink-0 flex-col gap-6 rounded-2xl border border-warm-200 bg-white p-5 lg:sticky lg:top-24 lg:flex"
    >
      <div className="flex items-center gap-3 border-b border-warm-200 pb-4">
        <span
          aria-hidden
          className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 font-body text-base font-medium text-brand-700"
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-sm font-medium text-warm-900">
            {name}
          </p>
          {user.email && (
            <p className="truncate font-body text-xs text-warm-600">
              {user.email}
            </p>
          )}
        </div>
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
