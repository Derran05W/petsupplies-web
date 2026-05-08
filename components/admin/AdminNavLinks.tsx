'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_LINKS, isAdminLinkActive } from './nav-links';

/**
 * Active-link island for the admin desktop sidebar. Mirrors
 * `<AccountNavLinks />` exactly — `usePathname()` decides which entry
 * gets `aria-current="page"`. Disabled entries render as a grey,
 * unfocusable list item with a "Coming soon" badge so the spec's full
 * sidebar shape is visible without shipping the pages.
 */
export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {ADMIN_NAV_LINKS.map((link) => {
        const Icon = link.icon;
        if (link.disabled) {
          return (
            <li key={link.href}>
              <span
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-warm-400"
              >
                <Icon size={16} aria-hidden />
                <span className="flex-1">{link.label}</span>
                <span className="rounded-full bg-warm-100 px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.06em] text-warm-600">
                  Soon
                </span>
              </span>
            </li>
          );
        }
        const active = isAdminLinkActive(pathname, link);
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
