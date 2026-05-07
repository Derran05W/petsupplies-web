'use client';

import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterControls } from './FilterControls';

interface FilterDrawerProps {
  activeCount: number;
}

/**
 * Mobile-only filter affordance. Renders a "Filters (n)" trigger button
 * and a bottom sheet that slides up from the bottom of the viewport.
 *
 * Accessibility:
 *   - The sheet is a real `role="dialog" aria-modal="true"` panel.
 *   - Body scroll locks while open; restores prior overflow on close.
 *   - Esc closes; backdrop click closes; close button closes and returns
 *     focus to the trigger.
 */
export function FilterDrawer({ activeCount }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

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
    closeRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-warm-300 bg-white px-4 py-2 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
      >
        <SlidersHorizontal size={16} aria-hidden />
        Filters
        {activeCount > 0 ? (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-400 font-body text-xs font-medium text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          role="presentation"
          onClick={close}
          className={cn(
            'absolute inset-0 bg-warm-900/40 transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          className={cn(
            'absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-warm-50 shadow-xl transition-transform duration-300 ease-in-out',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-warm-200 px-6 py-4">
            <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
              Filters
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close filters"
              className="inline-flex size-9 items-center justify-center rounded-lg text-warm-900 hover:bg-warm-100"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <FilterControls />
          </div>
          <div className="border-t border-warm-200 px-6 py-4">
            <button
              type="button"
              onClick={close}
              className="w-full rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm text-white transition-colors hover:bg-brand-500"
            >
              See results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
