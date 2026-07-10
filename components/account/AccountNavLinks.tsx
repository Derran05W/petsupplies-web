'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { preserveReturnOnAccountHref } from '@/lib/navigation/append-return-to';
import { ACCOUNT_NAV_LINKS, isAccountLinkActive } from './nav-links';

function AccountNavLinksFallback() {
  return (
    <ul className="flex flex-col gap-1" aria-hidden>
      {ACCOUNT_NAV_LINKS.map((link) => (
        <li key={link.href}>
          <div className="h-10 animate-pulse rounded-pill bg-panel" />
        </li>
      ))}
    </ul>
  );
}

function AccountNavLinksInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return (
    <ul className="flex flex-col gap-1">
      {ACCOUNT_NAV_LINKS.map((link) => {
        const Icon = link.icon;
        const active = isAccountLinkActive(pathname, link);
        const href = preserveReturnOnAccountHref(link.href, returnTo);
        return (
          <li key={link.href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-pill px-4 py-2.5 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
                active
                  ? 'bg-ink text-paper'
                  : 'text-ink-muted hover:bg-panel hover:text-ink',
              )}
            >
              <Icon size={16} aria-hidden />
              <span>{link.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Active-link island for the desktop sidebar. Preserves `?returnTo=` across
 * account routes so the shell back control keeps pointing at the shop page.
 */
export function AccountNavLinks() {
  return (
    <Suspense fallback={<AccountNavLinksFallback />}>
      <AccountNavLinksInner />
    </Suspense>
  );
}
