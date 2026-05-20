'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { appendReturnTo } from '@/lib/navigation/append-return-to';
import { usePendingAccountNavigation } from '@/hooks/usePendingAccountNavigation';
import { cn } from '@/lib/utils';

interface AccountAvatarLinkProps {
  href?: string;
  className?: string;
  ariaLabel: string;
  initial: string;
}

/**
 * Navbar account avatar — instant navigation via `<Link>`. If still off
 * `/account` after ~0.8s, the initial becomes a spinner.
 */
export function AccountAvatarLink({
  href,
  className,
  ariaLabel,
  initial,
}: AccountAvatarLinkProps) {
  const pathname = usePathname();
  const target = href ?? appendReturnTo('/account', pathname);
  const { showSpinner, markPending } = usePendingAccountNavigation(target);

  return (
    <Link
      href={target}
      onClick={markPending}
      aria-label={ariaLabel}
      aria-busy={showSpinner}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full bg-brand-50 font-body text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100',
        className,
      )}
    >
      {showSpinner ? (
        <Loader2
          size={16}
          className="animate-spin text-brand-600"
          aria-hidden
        />
      ) : (
        initial
      )}
      {showSpinner ? <span className="sr-only">Opening account</span> : null}
    </Link>
  );
}
