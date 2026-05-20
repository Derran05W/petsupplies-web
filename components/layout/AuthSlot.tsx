'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  getAccountDisplayName,
  getAccountInitial,
} from '@/lib/account/user-display';
import { cn } from '@/lib/utils';
import { AccountAvatarLink } from './AccountAvatarLink';

interface AuthSlotProps {
  className?: string;
}

export function AuthSlot({ className }: AuthSlotProps) {
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

  return (
    <AccountAvatarLink
      ariaLabel={`Go to account for ${displayName}`}
      initial={initial}
      className={className}
    />
  );
}
