'use client';

import { useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Admin-sidebar sign-out trigger. A thin wrapper around
 * `useAuth().signOut()` that mirrors `<AccountSignOutButton />`'s
 * spinner + disabled-during-flight pattern. Kept separate from the
 * customer one so labels / styling can diverge later (e.g. an admin-
 * specific "End admin session" copy without touching the customer
 * surface).
 */
export function AdminSignOutButton() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await signOut();
        } finally {
          setBusy(false);
        }
      }}
      className="flex w-full items-center gap-3 rounded-pill px-3 py-2.5 font-body text-micro uppercase text-ink-muted transition-colors duration-fast hover:bg-panel hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? (
        <Loader2 size={16} aria-hidden className="animate-spin" />
      ) : (
        <LogOut size={16} aria-hidden />
      )}
      <span>Sign out</span>
    </button>
  );
}
