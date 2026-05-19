'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useCartCount, useCartHasHydrated } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { DrawerPortal } from '@/components/layout/DrawerPortal';
import { CartContents } from './CartContents';
import { FreeShippingProgress } from './FreeShippingProgress';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-from-right desktop cart panel. Modeled on `MobileMenu` for
 * accessibility — scroll-lock, ESC to close, focus trap, and focus
 * return is handled by the trigger (see `NavbarShell`).
 *
 * Mobile users never see this drawer (`hidden lg:block`); they navigate
 * to `/cart` instead via `<CartIcon />`'s mobile link variant.
 */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const hasHydrated = useCartHasHydrated();
  const count = useCartCount();
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

  const headerLabel = hasHydrated ? `Cart (${count})` : 'Cart';

  return (
    <DrawerPortal>
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[100] hidden lg:block',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          role="presentation"
          onClick={onClose}
          className={cn(
            'absolute inset-0 bg-overlay transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className={cn(
            'absolute right-0 top-0 z-[1] flex h-full w-full max-w-md flex-col bg-surface-drawer text-warm-900 shadow-xl transition-transform duration-300 ease-in-out',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="shrink-0 border-b border-warm-200 bg-surface-drawer px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 flex-col gap-3">
                <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
                  {headerLabel}
                </h2>
                {hasHydrated && count > 0 ? (
                  <FreeShippingProgress compact />
                ) : null}
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-drawer">
            <CartContents variant="drawer" onClose={onClose} />
          </div>
        </div>
      </div>
    </DrawerPortal>
  );
}
