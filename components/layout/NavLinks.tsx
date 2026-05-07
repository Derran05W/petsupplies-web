'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/products?petType=dog', label: 'Dogs' },
  { href: '/products?petType=cat', label: 'Cats' },
  { href: '/products?petType=bird', label: 'Birds' },
  { href: '/products?petType=small-animal', label: 'Small animals' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  const hrefPath = href.split('?')[0] ?? href;
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

interface NavLinksProps {
  className?: string;
  itemClassName?: string;
  onNavigate?: () => void;
}

export function NavLinks({
  className,
  itemClassName,
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={cn('flex items-center gap-7', className)}>
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              className={cn(
                'font-body text-sm transition-colors',
                active ? 'text-warm-900' : 'text-warm-600 hover:text-warm-900',
                itemClassName,
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
