'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from './NavLinks';
import { AuthSlot } from './AuthSlot';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
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
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        role="presentation"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-warm-900/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-warm-50 shadow-xl transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-warm-200 px-6 py-4">
          <span
            className="inline-flex items-baseline gap-0.5 font-body text-lg font-medium text-warm-900"
            aria-hidden
          >
            {(() => {
              const words = brand.name.split(' ');
              const n = brand.logoAccentWords ?? 1;
              const accent = words.slice(0, n).join(' ');
              const rest = words.slice(n).join(' ');
              return (
                <>
                  <span className="text-brand-600">{accent}</span>
                  {rest && <span>{rest}</span>}
                </>
              );
            })()}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex size-9 items-center justify-center rounded-lg text-warm-900 hover:bg-warm-100"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const hrefPath = link.href.split('?')[0] ?? link.href;
              const active =
                hrefPath === '/'
                  ? pathname === '/'
                  : pathname === hrefPath ||
                    pathname.startsWith(`${hrefPath}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-3 py-3 font-body text-base transition-colors',
                      active
                        ? 'bg-warm-100 text-warm-900'
                        : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-warm-200 px-6 py-5">
          <AuthSlot />
        </div>
      </div>
    </div>
  );
}
