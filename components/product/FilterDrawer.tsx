'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, NAV_LINK_CLASSES } from '@/components/ui';
import { FilterControls } from './FilterControls';

interface FilterDrawerProps {
  activeCount: number;
}

/**
 * Mobile-only filter affordance. Renders a "Filters (n)" pill trigger and
 * a bottom sheet that slides up from the bottom of the viewport.
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
        className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-ink bg-transparent px-5 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
      >
        Filters
        {activeCount > 0 ? (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-pine font-body text-[10px] font-semibold leading-none text-paper">
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
            'absolute inset-0 bg-scrim transition-opacity duration-base',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          className={cn(
            'absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-card border-t border-line bg-paper text-ink shadow-lifted transition-transform duration-base ease-soft',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
              Filters
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close filters"
              className={cn(
                NAV_LINK_CLASSES,
                'font-body text-label uppercase text-ink',
              )}
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <FilterControls />
          </div>
          <div className="border-t border-line px-6 py-4">
            <Button onClick={close} className="w-full px-5 py-3.5">
              See results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
