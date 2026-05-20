'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useDelayedPending } from './useDelayedPending';

function accountPathFromHref(href: string): string {
  return href.split('?')[0] ?? href;
}

function isOnAccountHref(pathname: string, href: string): boolean {
  const accountPath = accountPathFromHref(href);
  return pathname === accountPath || pathname.startsWith(`${accountPath}/`);
}

/**
 * Tracks a normal `<Link>` click to `/account` until the route arrives.
 * After {@link NAVIGATION_FEEDBACK_DELAY_MS}, shows feedback only if still
 * not on the account route (e.g. slow network / server).
 */
export function usePendingAccountNavigation(accountHref: string) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const showSpinner = useDelayedPending(pending);

  useEffect(() => {
    if (pending && isOnAccountHref(pathname, accountHref)) {
      setPending(false);
    }
  }, [pending, pathname, accountHref]);

  function markPending() {
    if (!isOnAccountHref(pathname, accountHref)) {
      setPending(true);
    }
  }

  return { showSpinner, markPending };
}
