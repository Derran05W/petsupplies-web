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
      className="mb-8 flex flex-wrap gap-2 border-b border-warm-200 pb-4"
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
              'rounded-lg px-4 py-2 font-body text-sm transition-colors',
              active
                ? 'bg-brand-50 font-medium text-brand-700'
                : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
