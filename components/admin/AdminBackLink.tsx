'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AdminBackLinkProps {
  className?: string;
}

/** Returns from the admin console to the storefront. */
export function AdminBackLink({ className }: AdminBackLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2 font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
        className,
      )}
    >
      <span aria-hidden className="shrink-0">
        ←
      </span>
      Back
    </Link>
  );
}
