'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { safeReturnPath } from '@/lib/navigation/safe-return-path';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'accountReturnTo';

function readStoredReturn(): string | null {
  try {
    return safeReturnPath(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function AccountBackLinkInner({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramRaw = searchParams.get('returnTo');
  const fromParam = safeReturnPath(paramRaw);

  const [fromStorage, setFromStorage] = useState<string | null>(null);

  useEffect(() => {
    if (fromParam) {
      try {
        sessionStorage.setItem(STORAGE_KEY, fromParam);
      } catch {
        /* ignore quota / private mode */
      }
      return;
    }
    setFromStorage(readStoredReturn());
  }, [fromParam]);

  const destination = fromParam ?? fromStorage;

  const baseClass =
    'inline-flex items-center gap-2 font-body text-micro uppercase text-ink no-underline opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine';

  function handleBack() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    router.back();
  }

  if (destination) {
    return (
      <Link
        href={destination}
        className={cn(baseClass, className)}
        onClick={() => {
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }}
      >
        <span aria-hidden>←</span>
        Back
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(baseClass, className)}
    >
      <span aria-hidden>←</span>
      Back
    </button>
  );
}

/**
 * Returns the shopper to the page they were on before opening account (via
 * `?returnTo=` from the settings drawer) or uses browser history when unknown.
 */
export function AccountBackLink({ className }: { className?: string }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'h-7 w-20 animate-pulse rounded-tile bg-panel',
            className,
          )}
          aria-hidden
        />
      }
    >
      <AccountBackLinkInner className={className} />
    </Suspense>
  );
}
