'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
 * Site-wide product search panel. Opens from the navbar search trigger,
 * submits to `/products?search=`, and closes on navigation or Escape.
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
            'absolute inset-0 bg-overlay transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          className={cn(
            'absolute inset-x-0 top-0 border-b border-warm-200 bg-warm-50 px-6 py-4 shadow-md transition-transform duration-200 md:px-8 lg:px-12',
            open ? 'translate-y-0' : '-translate-y-full',
          )}
        >
          <form
            className="mx-auto flex max-w-3xl items-center gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <label className="relative flex min-w-0 flex-1 items-center">
              <span className="sr-only">Search products</span>
              <Search
                size={18}
                aria-hidden
                className="pointer-events-none absolute left-3.5 text-warm-400"
              />
              <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Search treats, food, toys…"
                className="h-12 w-full rounded-lg border border-warm-300 bg-surface-card pl-11 pr-4 font-body text-base text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-brand-500 px-5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100"
            >
              <X size={18} aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </DrawerPortal>
  );
}
