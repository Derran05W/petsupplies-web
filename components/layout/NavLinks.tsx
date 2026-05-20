'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStorefrontHeaderNav } from '@/components/providers/StorefrontNavProvider';
import { isNavLinkActive } from '@/lib/site/nav-utils';
import { cn } from '@/lib/utils';

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
  const links = useStorefrontHeaderNav();

  return (
    <ul className={cn('flex items-center gap-7', className)}>
      {links.map((link) => {
        const active = isNavLinkActive(pathname, link.href);
        return (
          <li key={`${link.href}-${link.position}`}>
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
