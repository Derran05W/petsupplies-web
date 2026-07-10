'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { preserveReturnOnAccountHref } from '@/lib/navigation/append-return-to';
import { ACCOUNT_NAV_LINKS, isAccountLinkActive } from './nav-links';

function AccountBottomTabsFallback() {
  return (
    <nav
      aria-hidden
      className="bg-paper/95 sticky bottom-0 z-30 border-t border-line backdrop-blur-sm lg:hidden"
    >
      <ul className="grid grid-cols-4 sm:grid-cols-7">
        {ACCOUNT_NAV_LINKS.map((link) => (
          <li key={link.href} className="p-2">
            <div className="mx-auto h-10 w-12 animate-pulse rounded-tile bg-panel" />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AccountBottomTabsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return (
    <nav
      aria-label="Account navigation"
      className="bg-paper/95 sticky bottom-0 z-30 border-t border-line backdrop-blur-sm lg:hidden"
    >
      <ul className="grid grid-cols-4 sm:grid-cols-7">
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
                  'flex flex-col items-center justify-center gap-1 px-2 py-2.5 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
                  active ? 'text-pine' : 'text-ink-muted hover:text-ink',
                )}
              >
                <Icon size={18} aria-hidden />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Sticky bottom-tab navigation for `< lg` viewports. Mirrors the Admin
 * spec's mobile pattern and preserves `?returnTo=` like the desktop sidebar.
 */
export function AccountBottomTabs() {
  return (
    <Suspense fallback={<AccountBottomTabsFallback />}>
      <AccountBottomTabsInner />
    </Suspense>
  );
}
