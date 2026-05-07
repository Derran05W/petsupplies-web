'use client';

import { useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sign-out trigger for the account sidebar. Shows a spinner while
 * Supabase processes the request (and while the subsequent
 * `router.refresh()` settles). The hook then redirects to `/`.
 */
export function AccountSignOutButton() {
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
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-warm-600 transition-colors hover:bg-warm-100 hover:text-warm-900 disabled:cursor-not-allowed disabled:opacity-60"
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
