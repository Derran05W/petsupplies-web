'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStorefrontHeaderNav } from '@/components/providers/StorefrontNavProvider';
import { isNavLinkActive } from '@/lib/site/nav-utils';
import { NAV_LINK_CLASSES } from '@/components/ui';
import { cn } from '@/lib/utils';

interface NavLinksProps {
  className?: string;
  itemClassName?: string;
  onNavigate?: () => void;
}

/**
 * Admin-managed header links in the mockup's uppercase nav style. The
 * active link holds full opacity with a hairline underline; the rest sit
 * at 75% and sharpen on hover.
 */
export function NavLinks({
  className,
  itemClassName,
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname();
  const links = useStorefrontHeaderNav();

  return (
    <ul
      className={cn(
        'flex items-center gap-7 font-body text-label uppercase text-ink',
        className,
      )}
    >
      {links.map((link) => {
        const active = isNavLinkActive(pathname, link.href);
        return (
          <li key={`${link.href}-${link.position}`}>
            <Link
              href={link.href}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              className={cn(
                NAV_LINK_CLASSES,
                active
                  ? 'underline decoration-1 underline-offset-8 opacity-100'
                  : undefined,
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
