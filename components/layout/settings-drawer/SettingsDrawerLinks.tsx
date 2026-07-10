'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CreditCard,
  HelpCircle,
  Lock,
  MapPin,
  Palette,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { appendReturnTo } from '@/lib/navigation/append-return-to';

interface SettingsDrawerLinksProps {
  onNavigate: () => void;
}

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  {
    href: '/account/settings#preferences',
    label: 'Appearance',
    icon: Palette,
  },
  { href: '/account/settings#security', label: 'Security', icon: Lock },
  {
    href: '/account/settings#notifications',
    label: 'Notifications',
    icon: Bell,
  },
  { href: '/account/settings#addresses', label: 'Addresses', icon: MapPin },
  {
    href: '/account/settings#payments',
    label: 'Payment methods',
    icon: CreditCard,
  },
  { href: '/account/settings#privacy', label: 'Privacy', icon: Shield },
  {
    href: '/account/settings#help',
    label: 'Help',
    icon: HelpCircle,
  },
];

export function SettingsDrawerLinks({ onNavigate }: SettingsDrawerLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings shortcuts" className="px-6 py-3">
      <ul className="flex flex-col divide-y divide-line">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={appendReturnTo(href, pathname)}
              onClick={onNavigate}
              className="flex items-center gap-3 py-3.5 font-body text-label uppercase text-ink no-underline opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pine"
            >
              <Icon size={15} aria-hidden className="shrink-0 text-ink-faint" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
