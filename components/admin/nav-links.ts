import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Active when the current pathname starts with this prefix. Defaults
   * to `href`. Dashboard's matcher is exact (`'/admin'`) — without that
   * carve-out, `/admin/products` would also light up the Dashboard
   * entry because the `'/admin'` prefix is a prefix of every admin
   * route.
   */
  match?: string;
  /**
   * Disabled placeholder entries (Customers / Analytics) render in the
   * sidebar so the spec's nav shape is visible without us shipping the
   * pages. They're flagged here rather than removed so future phases
   * (21+) just flip the flag.
   */
  disabled?: boolean;
}

/**
 * The admin nav. Customers + Analytics are listed but disabled — they
 * belong to Phase 21+. Mobile bottom-tabs filter to the three live
 * entries (see `<AdminBottomTabs />`).
 */
export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    match: '/admin',
  },
  {
    href: '/admin/products',
    label: 'Products',
    icon: Package,
    match: '/admin/products',
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: ShoppingBag,
    match: '/admin/orders',
  },
  {
    href: '/admin/customers',
    label: 'Customers',
    icon: Users,
    match: '/admin/customers',
    disabled: true,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    match: '/admin/analytics',
    disabled: true,
  },
];

export function isAdminLinkActive(
  pathname: string,
  link: AdminNavLink,
): boolean {
  if (link.disabled) return false;
  if (link.href === '/admin') return pathname === '/admin';
  const prefix = link.match ?? link.href;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
