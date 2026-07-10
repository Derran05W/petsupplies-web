'use client';

import { useEffect } from 'react';
import { Button, PetIcon, TONE_CLASSES } from '@/components/ui';

interface ShopErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShopError({ error, reset }: ShopErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[shop]', error);
  }, [error]);

  return (
    <section
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center bg-paper px-gutter py-24 text-center text-ink"
    >
      <span
        aria-hidden
        className={`inline-flex size-16 items-center justify-center rounded-tile ${TONE_CLASSES.clay}`}
      >
        <PetIcon name="paw" className="size-10" />
      </span>
      <p className="mt-8 font-body text-kicker uppercase text-pine">
        Something went wrong
      </p>
      <h1 className="mt-4 max-w-[18ch] font-display text-display text-ink [&_em]:font-medium [&_em]:italic">
        We hit a <em>snag</em> loading this page.
      </h1>
      <p className="mt-6 max-w-[46ch] font-body text-lede leading-body text-ink-secondary">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/products" variant="ghost">
          Browse products
        </Button>
      </div>
    </section>
  );
}
