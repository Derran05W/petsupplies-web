'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { brand } from '@/lib/config/brand';

export function DangerZoneSection() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOutEverywhere() {
    setError(null);
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signOut({ scope: 'global' });
      if (err) {
        setError(err.message);
        return;
      }
      router.replace('/');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <section
      id="danger"
      aria-labelledby="danger-heading"
      className="scroll-mt-24 rounded-2xl border border-red-200 bg-red-50/40 p-6 md:p-8"
    >
      <h2
        id="danger-heading"
        className="mb-1 font-display text-2xl tracking-[-0.02em] text-red-900"
      >
        Danger zone
      </h2>
      <p className="mb-6 font-body text-sm text-red-800/80">
        Irreversible or sensitive actions for your account.
      </p>

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="mb-2 font-body text-sm font-semibold text-warm-900">
            Sign out everywhere
          </h3>
          <p className="mb-3 font-body text-xs text-warm-600">
            Ends all active sessions on every device. You&apos;ll need to sign
            in again.
          </p>
          {error ? (
            <p
              role="alert"
              className="mb-3 rounded-md border border-red-200 bg-surface-card px-3 py-2 font-body text-xs text-red-700"
            >
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={signingOut}
            onClick={() => void signOutEverywhere()}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-surface-card px-4 py-2 font-body text-sm font-medium text-red-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 size={14} aria-hidden className="animate-spin" />
            ) : null}
            Sign out everywhere
          </button>
        </div>

        <div className="border-t border-red-200 pt-6">
          <h3 className="mb-2 font-body text-sm font-semibold text-warm-900">
            Delete account
          </h3>
          <p className="mb-3 font-body text-xs text-warm-600">
            Account deletion is handled manually to protect your order history
            and subscriptions. Email us and we&apos;ll confirm within a few
            business days.
          </p>
          <a
            href={`mailto:${brand.supportEmail}?subject=Account%20deletion%20request`}
            className="font-body text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            Request account deletion
          </a>
        </div>
      </div>
    </section>
  );
}
