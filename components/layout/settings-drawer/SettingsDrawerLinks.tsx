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
    <nav
      aria-label="Settings shortcuts"
      className="bg-surface-drawer px-2 py-3"
    >
      <ul className="flex flex-col gap-0.5">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={appendReturnTo(href, pathname)}
              onClick={onNavigate}
              className="text-warm-800 flex items-center gap-3 rounded-lg px-4 py-2.5 font-body text-sm transition-colors hover:bg-warm-100"
            >
              <Icon size={16} aria-hidden className="text-warm-500 shrink-0" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
