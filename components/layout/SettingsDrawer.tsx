'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { NAV_LINK_CLASSES } from '@/components/ui';
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
            'absolute inset-0 bg-scrim transition-opacity duration-base',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          className={cn(
            'absolute right-0 top-0 z-[1] flex h-full w-full max-w-md flex-col border-l border-line bg-paper text-ink shadow-lifted transition-transform duration-base ease-soft',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="shrink-0 border-b border-line px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
                Settings
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close settings"
                className={cn(
                  NAV_LINK_CLASSES,
                  'shrink-0 font-body text-label uppercase text-ink',
                )}
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {loading ? (
              <div className="flex flex-1 flex-col gap-4 p-6" aria-busy>
                <div className="h-16 animate-pulse rounded-card bg-panel" />
                <div className="h-24 animate-pulse rounded-card bg-panel" />
                <div className="h-32 animate-pulse rounded-card bg-panel" />
              </div>
            ) : !user ? (
              <div className="p-6 font-body text-sm text-ink-muted">
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
