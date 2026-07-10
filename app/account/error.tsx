'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/account/PageHeader';

interface AccountErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function isApiConfigError(message: string): boolean {
  return /application not found/i.test(message);
}

export default function AccountError({ error, reset }: AccountErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[account]', error);
  }, [error]);

  const apiMisconfigured = isApiConfigError(error.message);

  return (
    <>
      <PageHeader
        heading="Your orders"
        description="We couldn’t load your order history right now."
      />
      <section
        role="alert"
        className="rounded-card border border-danger-border bg-danger-surface px-6 py-8 font-body text-sm text-danger-solid"
      >
        <p className="font-medium">
          {apiMisconfigured
            ? 'The store API is not reachable at the configured URL.'
            : 'Something went wrong loading your orders.'}
        </p>
        {apiMisconfigured ? (
          <p className="mt-2">
            Set{' '}
            <code className="rounded-tag bg-panel px-1 py-0.5 text-xs text-ink">
              NEXT_PUBLIC_API_URL
            </code>{' '}
            to a running petsupplies-api instance (e.g.{' '}
            <code className="rounded-tag bg-panel px-1 py-0.5 text-xs text-ink">
              http://localhost:3001
            </code>
            ) and restart{' '}
            <code className="rounded-tag bg-panel px-1 py-0.5 text-xs text-ink">
              next dev
            </code>
            .
          </p>
        ) : (
          <p className="mt-2">{error.message}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center justify-center rounded-pill border border-danger-solid bg-danger-solid px-6 py-2.5 font-body text-micro uppercase text-danger-on-solid transition-all duration-base ease-soft hover:border-danger-solid-hover hover:bg-danger-solid-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-danger-solid"
          >
            Try again
          </button>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            Browse products
          </Link>
        </div>
      </section>
    </>
  );
}
