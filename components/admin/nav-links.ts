import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  TicketPercent,
  Truck,
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
   * Disabled placeholder entries render in the sidebar as non-links.
   */
  disabled?: boolean;
  /**
   * When false, omitted from `<AdminBottomTabs />` (desktop sidebar only).
   */
  showInBottomTabs?: boolean;
}

/**
 * Admin navigation. Bottom tabs show a subset — see `<AdminBottomTabs />`.
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
    href: '/admin/fulfillment',
    label: 'Fulfillment',
    icon: Truck,
    match: '/admin/fulfillment',
  },
  {
    href: '/admin/customers',
    label: 'Customers',
    icon: Users,
    match: '/admin/customers',
    showInBottomTabs: false,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    match: '/admin/analytics',
    showInBottomTabs: false,
  },
  {
    href: '/admin/discounts',
    label: 'Discounts',
    icon: TicketPercent,
    match: '/admin/discounts',
    showInBottomTabs: false,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    match: '/admin/settings',
    showInBottomTabs: false,
  },
];

export function isAdminLinkActive(
  pathname: string,
  link: AdminNavLink,
): boolean {
  if (link.disabled) return false;
  if (link.href === '/admin') {
    return pathname === '/admin';
  }
  const prefix = link.match ?? link.href;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
