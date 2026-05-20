'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import {
  getAccountDisplayName,
  getAccountInitial,
} from '@/lib/account/user-display';
import { appendReturnTo } from '@/lib/navigation/append-return-to';
import { usePendingAccountNavigation } from '@/hooks/usePendingAccountNavigation';
import { cn } from '@/lib/utils';

interface SettingsDrawerHeaderProps {
  user: User;
  onNavigate: () => void;
}

export function SettingsDrawerHeader({
  user,
  onNavigate,
}: SettingsDrawerHeaderProps) {
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
      className="flex items-center gap-3 border-b border-warm-200 bg-surface-drawer px-6 py-4 transition-colors hover:bg-warm-100"
    >
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 font-body text-sm font-medium text-brand-700',
        )}
      >
        {showSpinner ? (
          <Loader2
            size={18}
            className="animate-spin text-brand-600"
            aria-hidden
          />
        ) : (
          initial
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-sm font-medium text-warm-900">
          {name}
        </p>
        {user.email ? (
          <p className="truncate font-body text-xs text-warm-600">
            {user.email}
          </p>
        ) : null}
      </div>
      <ChevronRight size={18} aria-hidden className="shrink-0 text-warm-400" />
      {showSpinner ? <span className="sr-only">Opening account</span> : null}
    </Link>
  );
}
