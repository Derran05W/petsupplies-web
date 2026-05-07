'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

const DEBOUNCE_MS = 350;

/**
 * Debounced search input. Local state holds the immediate value the user
 * is typing; a 350ms timer pushes the latest value into the URL via
 * `router.replace`. Mounting / unmounting always cleans up the pending
 * timer so closing the listing page mid-keystroke doesn't fire a stale
 * navigation.
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
    <label className="relative flex w-full items-center md:max-w-md">
      <span className="sr-only">Search products</span>
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3.5 text-warm-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search treats, food, toys…"
        className="h-11 w-full rounded-lg border border-warm-300 bg-white pl-10 pr-10 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-2 inline-flex size-7 items-center justify-center rounded-md text-warm-400 hover:bg-warm-100 hover:text-warm-900"
        >
          <X size={14} aria-hidden />
        </button>
      ) : null}
    </label>
  );
}
