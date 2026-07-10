'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import {
  getAccountDisplayName,
  getAccountInitial,
} from '@/lib/account/user-display';
import { appendReturnTo } from '@/lib/navigation/append-return-to';
import { usePendingAccountNavigation } from '@/hooks/usePendingAccountNavigation';

export function SettingsDrawerHeader({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const name = getAccountDisplayName(user);
  const initial = getAccountInitial(name);
  const accountHref = appendReturnTo('/account', pathname);
  const { showSpinner, markPending } = usePendingAccountNavigation(accountHref);

  return (
    <Link
      href={accountHref}
      onClick={() => {
        markPending();
        onNavigate();
      }}
      aria-label={`Go to account for ${name}`}
      aria-busy={showSpinner}
      className="flex items-center gap-3 border-b border-line px-6 py-4 no-underline transition-colors duration-fast hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pine"
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-tile-amber font-display text-base italic text-tile-amber-ink">
        {showSpinner ? (
          <Loader2 size={18} className="animate-spin" aria-hidden />
        ) : (
          initial
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-title text-ink">{name}</p>
        {user.email ? (
          <p className="truncate font-body text-xs text-ink-muted">
            {user.email}
          </p>
        ) : null}
      </div>
      <span aria-hidden className="shrink-0 text-ink-faint">
        →
      </span>
      {showSpinner ? <span className="sr-only">Opening account</span> : null}
    </Link>
  );
}
