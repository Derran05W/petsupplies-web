'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { isAdminUser } from '@/lib/account/user-display';
import type { SettingsDrawerProps } from '@/components/layout/settings-drawer/types';
import { DrawerPortal } from '@/components/layout/DrawerPortal';
import { SettingsDrawerAdminBanner } from './settings-drawer/SettingsDrawerAdminBanner';
import { SettingsDrawerFooter } from './settings-drawer/SettingsDrawerFooter';
import { SettingsDrawerHeader } from './settings-drawer/SettingsDrawerHeader';
import { SettingsDrawerLinks } from './settings-drawer/SettingsDrawerLinks';
import { SettingsDrawerOrders } from './settings-drawer/SettingsDrawerOrders';

/**
 * Slide-from-right settings panel. Mirrors `CartDrawer` a11y behaviour
 * (scroll-lock, ESC, focus trap). Available on all breakpoints.
 */
export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { user, loading, signOut } = useAuth();
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

  const handleNavigate = () => {
    onClose();
  };

  return (
    <DrawerPortal>
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[100]',
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
          aria-label="Settings"
          className={cn(
            'absolute right-0 top-0 z-[1] flex h-full w-full max-w-md flex-col bg-surface-drawer text-warm-900 shadow-xl transition-transform duration-300 ease-in-out',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="shrink-0 border-b border-warm-200 bg-surface-drawer px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
                Settings
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close settings"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface-drawer">
            {loading ? (
              <div
                className="flex flex-1 flex-col gap-4 bg-surface-drawer p-6"
                aria-busy
              >
                <div className="h-16 animate-pulse rounded-xl bg-warm-100" />
                <div className="h-24 animate-pulse rounded-xl bg-warm-100" />
                <div className="h-32 animate-pulse rounded-xl bg-warm-100" />
              </div>
            ) : !user ? (
              <div className="bg-surface-drawer p-6 font-body text-sm text-warm-600">
                Sign in to manage your account.
              </div>
            ) : (
              <>
                {isAdminUser(user) ? (
                  <SettingsDrawerAdminBanner onNavigate={handleNavigate} />
                ) : null}
                <SettingsDrawerHeader user={user} onNavigate={handleNavigate} />
                <SettingsDrawerOrders onNavigate={handleNavigate} />
                <SettingsDrawerLinks onNavigate={handleNavigate} />
                <SettingsDrawerFooter
                  onSignOut={async () => {
                    handleNavigate();
                    await signOut();
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </DrawerPortal>
  );
}
