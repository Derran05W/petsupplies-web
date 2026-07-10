'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockState } from '@/types/admin';

const DEBOUNCE_MS = 350;

interface FilterPill {
  value: StockState;
  label: string;
}

const PILLS: FilterPill[] = [
  { value: 'all', label: 'All' },
  { value: 'in_stock', label: 'In stock' },
  { value: 'low', label: 'Low' },
  { value: 'out', label: 'Out' },
];

/**
 * URL-driven toolbar for `/admin/products`. Same debounce + URL-replace
 * shape Phase 4's `<SearchBox />` uses, plus the stock-state pill
 * toggle. Both controls always reset `?page=` to 1 so a filter change
 * doesn't strand the user on an empty page.
 */
export function AdminProductsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get('search') ?? '';
  const urlStock = (searchParams.get('stock') as StockState | null) ?? 'all';
  const [value, setValue] = useState(urlValue);

  useEffect(() => {
    setValue(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (value === urlValue) return;
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.length === 0) params.delete('search');
      else params.set('search', value);
      params.delete('page');
      const qs = params.toString();
      router.replace(
        qs.length > 0 ? `/admin/products?${qs}` : '/admin/products',
        { scroll: false },
      );
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [value, urlValue, router, searchParams]);

  const handleStock = (next: StockState) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('stock');
    else params.set('stock', next);
    params.delete('page');
    const qs = params.toString();
    router.replace(
      qs.length > 0 ? `/admin/products?${qs}` : '/admin/products',
      { scroll: false },
    );
  };

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <label className="relative flex w-full items-center md:max-w-md">
        <span className="sr-only">Search admin products</span>
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute left-3.5 text-ink-faint"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products by name, tag, or description…"
          className="h-11 w-full rounded-tile border border-line bg-paper pl-10 pr-10 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => setValue('')}
            aria-label="Clear search"
            className="absolute right-2 inline-flex size-7 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          >
            <X size={14} aria-hidden />
          </button>
        )}
      </label>

      <div
        role="group"
        aria-label="Stock filter"
        className="flex flex-wrap items-center gap-1.5"
      >
        {PILLS.map((pill) => {
          const active = pill.value === urlStock;
          return (
            <button
              key={pill.value}
              type="button"
              onClick={() => handleStock(pill.value)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center rounded-pill border px-3 py-1.5 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
                active
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-transparent text-ink-secondary hover:border-ink',
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
