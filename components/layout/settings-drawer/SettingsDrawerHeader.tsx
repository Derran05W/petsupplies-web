'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { getAccountDisplayName } from '@/lib/account/user-display';
import { appendReturnTo } from '@/lib/navigation/append-return-to';

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
  const accountHref = appendReturnTo('/account', pathname);

  return (
    <Link
      href={accountHref}
      onClick={onNavigate}
      className="flex items-center gap-3 border-b border-warm-200 bg-surface-drawer px-6 py-4 transition-colors hover:bg-warm-100"
    >
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
    </Link>
  );
}
