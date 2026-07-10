'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { buildLoginHref } from '@/lib/navigation/login-href';
import { NAV_LINK_CLASSES } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AuthSlotProps {
  className?: string;
}

/**
 * Navbar sign-in affordance for guests, styled as uppercase nav text.
 * Signed-in users open Settings from the "Account" trigger and reach
 * account via the settings drawer profile row.
 */
export function AuthSlot({ className }: AuthSlotProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loginHref = buildLoginHref(pathname, searchParams.toString());

  if (loading) {
    return (
      <span
        aria-hidden
        className={cn('inline-block h-4 w-14 rounded bg-panel', className)}
      />
    );
  }

  if (!user) {
    return (
      <Link
        href={loginHref}
        className={cn(
          NAV_LINK_CLASSES,
          'font-body text-label uppercase text-ink',
          className,
        )}
      >
        Sign in
      </Link>
    );
  }

  return null;
}
