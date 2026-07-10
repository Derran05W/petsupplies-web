'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

const DEBOUNCE_MS = 350;

/**
 * Debounced search input on a hairline underline — boutique form styling.
 * Local state holds the immediate value the user is typing; a 350ms timer
 * pushes the latest value into the URL via `router.replace`. Mounting /
 * unmounting always cleans up the pending timer so closing the listing
 * page mid-keystroke doesn't fire a stale navigation.
 */
export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get('search') ?? '';
  const [value, setValue] = useState(urlValue);

  useEffect(() => {
    setValue(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (value === urlValue) return;
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.length === 0) {
        params.delete('search');
      } else {
        params.set('search', value);
      }
      params.delete('page');
      const qs = params.toString();
      router.replace(qs.length > 0 ? `/products?${qs}` : '/products', {
        scroll: false,
      });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [value, urlValue, router, searchParams]);

  return (
    <label className="relative flex w-full items-center border-b border-line transition-colors duration-fast focus-within:border-ink md:max-w-md">
      <span className="sr-only">Search products</span>
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-0 text-ink-faint"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search treats, food, toys…"
        className="h-11 w-full bg-transparent pl-7 pr-8 font-body text-sm text-ink placeholder:text-ink-faint focus:outline-none"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-0 inline-flex size-7 items-center justify-center text-ink-faint transition-colors duration-fast hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          <X size={14} aria-hidden />
        </button>
      ) : null}
    </label>
  );
}
