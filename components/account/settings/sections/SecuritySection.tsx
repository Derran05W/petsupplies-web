'use client';

import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SecuritySectionProps {
  email: string;
}

/**
 * Password resets use Supabase&apos;s email flow — we never show or store
 * the current password here.
 */
export function SecuritySection({ email }: SecuritySectionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendReset() {
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/login`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (err) {
        setError(err.message);
        return;
      }
      setSentTo(email);
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <section
        id="security"
        aria-labelledby="security-heading"
        className="scroll-mt-24 rounded-card border border-line bg-paper p-6 md:p-8"
      >
        <h2
          id="security-heading"
          className="mb-4 font-display text-2xl tracking-[-0.01em] text-ink"
        >
          Security
        </h2>
        <div className="flex flex-col gap-4 rounded-tile border border-line bg-panel p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex size-10 items-center justify-center rounded-tile bg-tile-sage text-tile-sage-ink"
            >
              <Mail size={18} />
            </span>
            <p className="font-body text-sm font-medium text-ink">
              Check your inbox
            </p>
          </div>
          <p className="font-body text-sm leading-body text-ink-secondary">
            We sent a reset link to{' '}
            <span className="font-medium text-ink">{sentTo}</span>. Follow the
            link to choose a new password.
          </p>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="self-start border-b border-ink pb-0.5 font-body text-micro uppercase text-ink transition-opacity duration-fast hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="scroll-mt-24 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      <h2
        id="security-heading"
        className="mb-1 font-display text-2xl tracking-[-0.01em] text-ink"
      >
        Security
      </h2>
      <p className="mb-6 font-body text-sm text-ink-secondary">
        Manage how you sign in. For security, passwords are never shown in the
        browser — use a reset link to change yours.
      </p>

      <div className="flex flex-col gap-6">
        <div className="rounded-tile border border-line bg-panel p-5">
          <h3 className="mb-2 font-body text-sm font-semibold text-ink">
            Password
          </h3>
          <p className="mb-4 font-body text-xs text-ink-muted">
            We&apos;ll email you a secure link to set a new password.
          </p>
          {error ? (
            <p
              role="alert"
              className="mb-3 rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-xs text-danger-solid"
            >
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={submitting || !email}
            onClick={() => void sendReset()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-5 py-2 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={14} aria-hidden className="animate-spin" />
            ) : null}
            Email me a reset link
          </button>
        </div>

        <div className="rounded-tile border border-line bg-panel p-5 opacity-80">
          <h3 className="mb-2 font-body text-sm font-semibold text-ink">
            Two-factor authentication
          </h3>
          <p className="font-body text-xs text-ink-muted">
            Coming soon — we&apos;ll support authenticator apps and SMS in a
            future release.
          </p>
        </div>

        <div className="rounded-tile border border-line bg-panel p-5 opacity-80">
          <h3 className="mb-2 font-body text-sm font-semibold text-ink">
            Active sessions
          </h3>
          <p className="font-body text-xs text-ink-muted">
            Session management requires a backend listing endpoint — not
            available yet.
          </p>
        </div>
      </div>
    </section>
  );
}
