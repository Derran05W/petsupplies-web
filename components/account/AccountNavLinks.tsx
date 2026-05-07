'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ACCOUNT_NAV_LINKS, isAccountLinkActive } from './nav-links';

/**
 * Active-link island for the desktop sidebar. Server-renders the chrome,
 * client-renders the active state via `usePathname()` — same pattern
 * `<NavLinks />` uses for the top-of-page nav.
 */
export function AccountNavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {ACCOUNT_NAV_LINKS.map((link) => {
        const Icon = link.icon;
        const active = isAccountLinkActive(pathname, link);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors',
                active
                  ? 'bg-warm-100 text-warm-900'
                  : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900',
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
