'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SETTINGS_TABS = [
  { href: '/admin/settings', label: 'General', exact: true },
  { href: '/admin/settings/homepage', label: 'Homepage', exact: false },
  { href: '/admin/settings/navigation', label: 'Navigation', exact: false },
  { href: '/admin/settings/pages', label: 'Pages', exact: false },
  { href: '/admin/settings/emails', label: 'Emails', exact: false },
] as const;

export function AdminSettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4"
    >
      {SETTINGS_TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-pill px-4 py-2 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
              active ? 'bg-ink text-paper' : 'text-ink-muted hover:text-ink',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
