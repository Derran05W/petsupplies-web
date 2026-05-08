import { MapPin, Package, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AccountNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Active when the current pathname starts with this prefix. Defaults
   * to `href`. We keep the index `/account` route as Orders, so its
   * matcher is exact (`'/account'`); `/account/orders` and
   * `/account/orders/[id]` use the longer prefix.
   */
  match?: string;
}

/**
 * Flat array — Phase 14 (Wishlist), 15 (Pet profiles), 16 (Subscriptions),
 * 18 (Notifications) just append entries here.
 */
export const ACCOUNT_NAV_LINKS: AccountNavLink[] = [
  {
    href: '/account',
    label: 'Orders',
    icon: Package,
    match: '/account',
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    icon: MapPin,
    match: '/account/addresses',
  },
  {
    href: '/account/settings',
    label: 'Settings',
    icon: Settings,
    match: '/account/settings',
  },
];

/**
 * Match the current pathname to the active nav entry. The Orders entry
 * lives at `/account` (the index) — so we treat `/account` as exact and
 * `/account/orders*` as also Orders.
 */
export function isAccountLinkActive(
  pathname: string,
  link: AccountNavLink,
): boolean {
  if (link.href === '/account') {
    return pathname === '/account' || pathname.startsWith('/account/orders');
  }
  const prefix = link.match ?? link.href;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
