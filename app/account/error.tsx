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
        className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 font-body text-sm text-red-900"
      >
        <p className="font-medium">
          {apiMisconfigured
            ? 'The store API is not reachable at the configured URL.'
            : 'Something went wrong loading your orders.'}
        </p>
        {apiMisconfigured ? (
          <p className="mt-2 text-red-800">
            Set{' '}
            <code className="rounded bg-red-100 px-1 py-0.5 text-xs">
              NEXT_PUBLIC_API_URL
            </code>{' '}
            to a running petsupplies-api instance (e.g.{' '}
            <code className="rounded bg-red-100 px-1 py-0.5 text-xs">
              http://localhost:3001
            </code>
            ) and restart{' '}
            <code className="rounded bg-red-100 px-1 py-0.5 text-xs">
              next dev
            </code>
            .
          </p>
        ) : (
          <p className="mt-2 text-red-800">{error.message}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-950"
          >
            Try again
          </button>
          <Link
            href="/products"
            className="inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-900 transition-colors hover:bg-red-100"
          >
            Browse products
          </Link>
        </div>
      </section>
    </>
  );
}
