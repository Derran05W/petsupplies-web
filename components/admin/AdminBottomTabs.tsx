'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_LINKS, isAdminLinkActive } from './nav-links';

/**
 * Sticky bottom-tab navigation for `< lg` viewports. Shows dashboard,
 * catalogue, orders, and fulfillment. Customers + Analytics stay
 * sidebar-only (narrow screens).
 */
export function AdminBottomTabs() {
  const pathname = usePathname();
  const tabs = ADMIN_NAV_LINKS.filter(
    (link) => !link.disabled && link.showInBottomTabs !== false,
  );

  return (
    <nav
      aria-label="Admin navigation"
      className="sticky bottom-0 z-30 border-t border-warm-200 bg-warm-50/95 backdrop-blur-sm lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((link) => {
          const Icon = link.icon;
          const active = isAdminLinkActive(pathname, link);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-2 py-2.5 font-body text-[11px] transition-colors',
                  active
                    ? 'text-brand-600'
                    : 'text-warm-600 hover:text-warm-900',
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
