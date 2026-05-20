'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AuthSlotProps {
  className?: string;
}

/**
 * Navbar sign-in affordance for guests. Signed-in users open Settings
 * from the gear icon and reach account via the settings drawer profile row.
 */
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

  return null;
}
