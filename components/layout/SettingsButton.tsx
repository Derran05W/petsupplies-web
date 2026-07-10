'use client';

import { forwardRef } from 'react';
import { NAV_LINK_CLASSES } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SettingsButtonProps {
  onOpen: () => void;
  className?: string;
}

/**
 * Navbar trigger for the account settings drawer — uppercase "Account"
 * nav text (accessible name stays "Open settings"). Forward-ref so the
 * shell can restore focus after the dialog closes.
 */
export const SettingsButton = forwardRef<
  HTMLButtonElement,
  SettingsButtonProps
>(function SettingsButton({ onOpen, className }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label="Open settings"
      className={cn(NAV_LINK_CLASSES, 'uppercase', className)}
    >
      Account
    </button>
  );
});
