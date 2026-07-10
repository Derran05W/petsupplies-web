'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINK_CLASSES } from '@/components/ui';
import { DrawerPortal } from '@/components/layout/DrawerPortal';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

function buildProductsSearchHref(query: string): string {
  const trimmed = query.trim();
  if (trimmed.length === 0) return '/products';
  const params = new URLSearchParams({ search: trimmed });
  return `/products?${params.toString()}`;
}

/**
 * Site-wide product search panel: paper slide-down under the nav with a
 * big Fraunces input over a hairline rule. Opens from the navbar search
 * trigger, submits to `/products?search=`, and closes on navigation or
 * Escape.
 */
export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) return;
    setValue('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
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
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  function submitSearch() {
    router.push(buildProductsSearchHref(value));
    onClose();
  }

  return (
    <DrawerPortal>
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-50',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          role="presentation"
          onClick={onClose}
          className={cn(
            'absolute inset-0 bg-scrim transition-opacity duration-fast',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          className={cn(
            'absolute inset-x-0 top-0 border-b border-line bg-paper px-gutter py-8 transition-transform duration-fast',
            open ? 'translate-y-0' : '-translate-y-full',
          )}
        >
          <form
            className="mx-auto flex max-w-wrap items-end gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <label className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="font-body text-kicker uppercase text-pine">
                Search
              </span>
              <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Search treats, food, toys…"
                className="w-full border-0 border-b border-line bg-transparent pb-3 font-display text-[clamp(1.4rem,3vw,2.2rem)] leading-tight text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="shrink-0 cursor-pointer rounded-pill border border-ink bg-ink px-7 py-3.5 font-body text-button uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className={cn(
                NAV_LINK_CLASSES,
                'shrink-0 pb-4 font-body text-label uppercase text-ink',
              )}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </DrawerPortal>
  );
}
