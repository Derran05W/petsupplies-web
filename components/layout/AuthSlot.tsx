'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  getAccountDisplayName,
  getAccountInitial,
} from '@/lib/account/user-display';
import { appendReturnTo } from '@/lib/navigation/append-return-to';
import { cn } from '@/lib/utils';

interface AuthSlotProps {
  className?: string;
}

export function AuthSlot({ className }: AuthSlotProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        aria-hidden
        className={cn('h-8 w-16 rounded-md bg-warm-100', className)}
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          'font-body text-sm text-warm-600 transition-colors hover:text-warm-900',
          className,
        )}
      >
        Sign in
      </Link>
    );
  }

  const displayName = getAccountDisplayName(user);
  const initial = getAccountInitial(displayName);
  const accountHref = appendReturnTo('/account', pathname);

  return (
    <Link
      href={accountHref}
      aria-label={`Go to account for ${displayName}`}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full bg-brand-50 font-body text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100',
        className,
      )}
    >
      {initial}
    </Link>
  );
}
