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
      className="scroll-mt-24 rounded-card border border-danger-border bg-danger-surface p-6 md:p-8"
    >
      <h2
        id="danger-heading"
        className="mb-1 font-display text-2xl tracking-[-0.01em] text-danger-solid"
      >
        Danger zone
      </h2>
      <p className="mb-6 font-body text-sm text-ink-secondary">
        Irreversible or sensitive actions for your account.
      </p>

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="mb-2 font-body text-sm font-semibold text-ink">
            Sign out everywhere
          </h3>
          <p className="mb-3 font-body text-xs text-ink-muted">
            Ends all active sessions on every device. You&apos;ll need to sign
            in again.
          </p>
          {error ? (
            <p
              role="alert"
              className="mb-3 rounded-tile border border-danger-border bg-paper px-3 py-2 font-body text-xs text-danger-solid"
            >
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={signingOut}
            onClick={() => void signOutEverywhere()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-danger-solid bg-danger-solid px-6 py-2.5 font-body text-micro uppercase text-danger-on-solid transition-all duration-base ease-soft hover:border-danger-solid-hover hover:bg-danger-solid-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-danger-solid disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? (
              <Loader2 size={14} aria-hidden className="animate-spin" />
            ) : null}
            Sign out everywhere
          </button>
        </div>

        <div className="border-t border-danger-border pt-6">
          <h3 className="mb-2 font-body text-sm font-semibold text-ink">
            Delete account
          </h3>
          <p className="mb-3 font-body text-xs text-ink-muted">
            Account deletion is handled manually to protect your order history
            and subscriptions. Email us and we&apos;ll confirm within a few
            business days.
          </p>
          <a
            href={`mailto:${brand.supportEmail}?subject=Account%20deletion%20request`}
            className="inline-flex border-b border-danger-solid pb-0.5 font-body text-micro uppercase text-danger-solid transition-opacity duration-fast hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-danger-solid"
          >
            Request account deletion
          </a>
        </div>
      </div>
    </section>
  );
}
