'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
        'text-warm-700 inline-flex items-center gap-2 font-body text-sm font-medium transition-colors hover:text-warm-900',
        className,
      )}
    >
      <ArrowLeft size={16} aria-hidden className="text-warm-500 shrink-0" />
      Back
    </Link>
  );
}
