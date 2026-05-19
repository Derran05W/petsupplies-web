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
        className="scroll-mt-24 rounded-2xl border border-warm-200 bg-surface-card p-6 md:p-8"
      >
        <h2
          id="security-heading"
          className="mb-4 font-display text-2xl tracking-[-0.02em] text-warm-900"
        >
          Security
        </h2>
        <div className="bg-brand-50/60 flex flex-col gap-4 rounded-xl border border-brand-100 p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex size-10 items-center justify-center rounded-full bg-brand-100 text-brand-600"
            >
              <Mail size={18} />
            </span>
            <p className="font-body text-sm font-medium text-warm-900">
              Check your inbox
            </p>
          </div>
          <p className="font-body text-sm leading-relaxed text-warm-600">
            We sent a reset link to{' '}
            <span className="font-medium text-warm-900">{sentTo}</span>. Follow
            the link to choose a new password.
          </p>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="self-start font-body text-sm font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
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
      className="scroll-mt-24 rounded-2xl border border-warm-200 bg-surface-card p-6 md:p-8"
    >
      <h2
        id="security-heading"
        className="mb-1 font-display text-2xl tracking-[-0.02em] text-warm-900"
      >
        Security
      </h2>
      <p className="mb-6 font-body text-sm text-warm-600">
        Manage how you sign in. For security, passwords are never shown in the
        browser — use a reset link to change yours.
      </p>

      <div className="flex flex-col gap-6">
        <div className="bg-warm-50/40 rounded-xl border border-warm-200 p-5">
          <h3 className="mb-2 font-body text-sm font-semibold text-warm-900">
            Password
          </h3>
          <p className="mb-4 font-body text-xs text-warm-600">
            We&apos;ll email you a secure link to set a new password.
          </p>
          {error ? (
            <p
              role="alert"
              className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 font-body text-xs text-red-700"
            >
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={submitting || !email}
            onClick={() => void sendReset()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-4 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={14} aria-hidden className="animate-spin" />
            ) : null}
            Email me a reset link
          </button>
        </div>

        <div className="bg-warm-50/40 rounded-xl border border-warm-200 p-5 opacity-80">
          <h3 className="mb-2 font-body text-sm font-semibold text-warm-900">
            Two-factor authentication
          </h3>
          <p className="font-body text-xs text-warm-600">
            Coming soon — we&apos;ll support authenticator apps and SMS in a
            future release.
          </p>
        </div>

        <div className="bg-warm-50/40 rounded-xl border border-warm-200 p-5 opacity-80">
          <h3 className="mb-2 font-body text-sm font-semibold text-warm-900">
            Active sessions
          </h3>
          <p className="font-body text-xs text-warm-600">
            Session management requires a backend listing endpoint — not
            available yet.
          </p>
        </div>
      </div>
    </section>
  );
}
