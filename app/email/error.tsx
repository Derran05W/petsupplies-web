'use client';

import { useEffect } from 'react';
import { Button, PetIcon, TONE_CLASSES } from '@/components/ui';
import { EmailPageShell } from '@/components/email/EmailPageShell';

interface EmailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the `/email/*` landing pages (order receipts, unsubscribe,
 * stock alerts, preferences). These are the surfaces non-technical recipients
 * reach straight from an email, so an unexpected throw must degrade to a calm,
 * on-brand card with a retry — never Next's raw "Application error" screen.
 *
 * Renders inside `app/email/layout.tsx` (wordmark + centered container), so it
 * only supplies the boutique error card, matching the house pattern in
 * `app/(shop)/error.tsx` and `app/account/error.tsx`.
 */
export default function EmailError({ error, reset }: EmailErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[email]', error);
  }, [error]);

  return (
    <div className="flex justify-center">
      <EmailPageShell>
        <div
          role="alert"
          className="flex flex-col items-center gap-4 text-center"
        >
          <span
            aria-hidden
            className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.clay}`}
          >
            <PetIcon name="paw" className="size-7" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="font-body text-kicker uppercase text-pine">
              Something went wrong
            </p>
            <h1 className="font-display text-2xl text-ink [&_em]:font-medium [&_em]:italic">
              We hit a <em>snag</em> loading this page
            </h1>
            <p className="font-body text-sm leading-body text-ink-secondary">
              {error.message ||
                'An unexpected error occurred. Please try again in a moment.'}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button href="/" variant="ghost">
              Go to homepage
            </Button>
          </div>
        </div>
      </EmailPageShell>
    </div>
  );
}
