'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
          className="animate-spin text-brand-500"
          aria-label="Updating subscription"
        />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center font-body">
        <h1 className="font-display text-2xl text-warm-900">
          You&apos;re unsubscribed
        </h1>
        <p className="mt-3 text-sm text-warm-600">
          We won&apos;t send marketing email to this address anymore.
        </p>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {errorMessage ??
        'We could not complete that unsubscribe link. Try again shortly.'}
    </div>
  );
}
