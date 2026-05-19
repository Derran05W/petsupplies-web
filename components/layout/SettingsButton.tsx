'use client';

import { forwardRef } from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsButtonProps {
  onOpen: () => void;
  className?: string;
}

/**
 * Navbar trigger for the account settings drawer. Forward-ref so the shell
 * can restore focus after the dialog closes.
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
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100',
        className,
      )}
    >
      <Settings size={18} aria-hidden />
    </button>
  );
});
