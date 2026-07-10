'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStorefrontBrand } from '@/components/providers/StorefrontBrandProvider';
import { useStorefrontHeaderNav } from '@/components/providers/StorefrontNavProvider';
import { isNavLinkActive } from '@/lib/site/nav-utils';
import { NAV_LINK_CLASSES, WORDMARK_CLASSES } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { AuthSlot } from './AuthSlot';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

/**
 * Full-height slide-from-right menu below `md`. Boutique treatment: paper
 * panel, hairline dividers, and the header links as big Fraunces rows —
 * the mobile cousin of the homepage category rows. A11y behaviour is
 * unchanged: scroll-lock, ESC to close, focus trap, focus return handled
 * by the trigger (see `NavbarShell`).
 */
export function MobileMenu({ open, onClose, onOpenSearch }: MobileMenuProps) {
  const brand = useStorefrontBrand();
  const headerLinks = useStorefrontHeaderNav();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 md:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-scrim transition-opacity duration-base',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-line bg-paper text-ink shadow-lifted transition-transform duration-base ease-soft',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-[1.05rem]">
          <span aria-hidden className={cn(WORDMARK_CLASSES, 'no-underline')}>
            {brand.name}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              NAV_LINK_CLASSES,
              'font-body text-label uppercase text-ink',
            )}
          >
            Close
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-6">
          {onOpenSearch ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className={cn(
                NAV_LINK_CLASSES,
                'mb-2 block w-full py-3 text-left font-body text-label uppercase text-ink-muted',
              )}
            >
              Search products →
            </button>
          ) : null}
          <ul className="flex flex-col">
            {headerLinks.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <li
                  key={`${link.href}-${link.position}`}
                  className="border-t border-line last:border-b"
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block py-5 font-display text-[1.7rem] leading-none tracking-[-0.01em] text-ink no-underline transition-all duration-base ease-soft hover:pl-2 hover:italic focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
                      active ? 'italic' : undefined,
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!loading && !user ? (
          <div className="border-t border-line px-6 py-5">
            <AuthSlot />
          </div>
        ) : null}
      </div>
    </div>
  );
}
