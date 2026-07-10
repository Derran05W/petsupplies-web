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
        'inline-flex size-8 items-center justify-center rounded-pill border border-ink bg-transparent font-body text-label uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
        className,
      )}
    >
      {showSpinner ? (
        <Loader2 size={16} className="animate-spin" aria-hidden />
      ) : (
        initial
      )}
      {showSpinner ? <span className="sr-only">Opening account</span> : null}
    </Link>
  );
}
