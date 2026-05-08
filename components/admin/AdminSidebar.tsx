import type { User } from '@supabase/supabase-js';
import { AdminNavLinks } from './AdminNavLinks';
import { AdminSignOutButton } from './AdminSignOutButton';

interface AdminSidebarProps {
  user: User;
}

function getDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | null;
  const name = meta?.['name'];
  if (typeof name === 'string' && name.trim().length > 0) return name.trim();
  return user.email ?? 'Admin';
}

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

/**
 * Server-rendered desktop sidebar for the admin surface. Identical
 * shape to `<AccountSidebar />` (avatar + name + email at the top, nav
 * island in the middle, sign-out at the bottom) — but the role label
 * underneath the email reads "Admin" so an admin who's also signed in
 * to the customer surface in another tab can tell them apart at a
 * glance.
 */
export function AdminSidebar({ user }: AdminSidebarProps) {
  const name = getDisplayName(user);
  const initial = getInitial(name);

  return (
    <aside
      aria-label="Admin navigation"
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
          <p className="truncate font-body text-xs uppercase tracking-[0.08em] text-brand-600">
            Admin
          </p>
        </div>
      </div>

      <nav aria-label="Admin">
        <AdminNavLinks />
      </nav>

      <div className="mt-auto border-t border-warm-200 pt-3">
        <AdminSignOutButton />
      </div>
    </aside>
  );
}
