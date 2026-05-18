'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ACCOUNT_NAV_LINKS, isAccountLinkActive } from './nav-links';

/**
 * Sticky bottom-tab navigation for `< lg` viewports. Mirrors the Admin
 * spec's mobile pattern (PLAN.md → Mobile Responsiveness → "Admin
 * sidebar: bottom tab bar on mobile") and reuses the same nav-link data
 * as the desktop sidebar.
 *
 * Sign-out is NOT a tab — it lives only in the desktop sidebar to keep
 * the mobile bar focused on three-tap access to the most common tasks.
 * Mobile users can still sign out via the global navbar's `<AuthSlot />`
 * dropdown (rendered inside `<MobileMenu />`).
 */
export function AccountBottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account navigation"
      className="sticky bottom-0 z-30 border-t border-warm-200 bg-warm-50/95 backdrop-blur-sm lg:hidden"
    >
      <ul className="grid grid-cols-6">
        {ACCOUNT_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const active = isAccountLinkActive(pathname, link);
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
