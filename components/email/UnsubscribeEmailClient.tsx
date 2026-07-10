'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PetIcon, TONE_CLASSES } from '@/components/ui';
import { ApiError } from '@/lib/api/client';
import { postEmailUnsubscribe } from '@/lib/api/email';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";

interface UnsubscribeEmailClientProps {
  token: string;
}

export function UnsubscribeEmailClient({ token }: UnsubscribeEmailClientProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await postEmailUnsubscribe(token);
        if (!cancelled) setStatus('success');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        const text =
          err instanceof ApiError
            ? err.isNetworkError
              ? NETWORK_ERROR_MESSAGE
              : (err.message ?? 'Something went wrong. Please try again.')
            : 'Something went wrong. Please try again.';
        setErrorMessage(text);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-10">
        <Loader2
          size={28}
          className="animate-spin text-pine motion-reduce:animate-none"
          aria-label="Updating subscription"
        />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 text-center font-body">
        <span
          aria-hidden
          className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.sage}`}
        >
          <PetIcon name="paw" className="size-7" />
        </span>
        <div className="flex flex-col gap-2">
          <p className="font-body text-kicker uppercase text-pine">All set</p>
          <h1 className="font-display text-2xl text-ink">
            You&apos;re unsubscribed
          </h1>
          <p className="text-sm leading-body text-ink-secondary">
            We won&apos;t send marketing email to this address anymore.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-tile border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger-solid"
    >
      {errorMessage ??
        'We could not complete that unsubscribe link. Try again shortly.'}
    </div>
  );
}
