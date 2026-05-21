'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CATEGORY_LABEL,
  PET_TYPE_LABEL,
  type Category,
  type PetType,
  type ProductFilters,
} from '@/types/product';
import {
  buildProductListingSearchParams,
  parseProductFilters,
} from '@/lib/utils/searchParams';
import { cn } from '@/lib/utils';

const PET_TYPES: ReadonlyArray<PetType> = [
  'dog',
  'cat',
  'bird',
  'fish',
  'reptile',
  'small-animal',
];
const CATEGORIES: ReadonlyArray<Category> = [
  'food',
  'treats',
  'accessories',
  'healthcare',
];

interface FilterControlsProps {
  onAfterChange?: () => void;
  className?: string;
}

/**
 * URL-driven filter group used by both the desktop sidebar and the mobile
 * bottom-sheet drawer. Reads current state from `useSearchParams`, pushes
 * updates with `router.replace` (no history entry per filter tweak).
 *
 * Pet type and category are single-value (matches the typed
 * `ProductFilters` interface). Clicking the active option clears it.
 */
export function FilterControls({
  onAfterChange,
  className,
}: FilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSearchParams = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );
  const filters = useMemo(
    () => parseProductFilters(rawSearchParams),
    [rawSearchParams],
  );

  const currentPetType = filters.petType;
  const currentCategory = filters.category;
  const currentMinPrice = searchParams.get('minPrice') ?? '';
  const currentMaxPrice = searchParams.get('maxPrice') ?? '';

  const replaceFilters = useCallback(
    (mutate: (next: ProductFilters) => void) => {
      const next: ProductFilters = { ...filters };
      mutate(next);
      const params = buildProductListingSearchParams(next, rawSearchParams);
      params.delete('page');
      const qs = params.toString();
      router.replace(qs.length > 0 ? `/products?${qs}` : '/products', {
        scroll: false,
      });
      if (onAfterChange) onAfterChange();
    },
    [filters, rawSearchParams, router, onAfterChange],
  );

  const togglePetType = (value: PetType) => {
    replaceFilters((next) => {
      if (next.petType === value) {
        delete next.petType;
      } else {
        next.petType = value;
      }
    });
  };

  const toggleCategory = (value: Category) => {
    replaceFilters((next) => {
      if (next.category === value) {
        delete next.category;
      } else {
        next.category = value;
      }
    });
  };

  const handlePriceChange = (key: 'minPrice' | 'maxPrice', value: string) => {
    const params = new URLSearchParams(
      buildProductListingSearchParams(filters, rawSearchParams).toString(),
    );
    if (value.length === 0) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs.length > 0 ? `/products?${qs}` : '/products', {
      scroll: false,
    });
    if (onAfterChange) onAfterChange();
  };

  const hasAnyFilter = useMemo(
    () =>
      Boolean(
        currentPetType ||
        currentCategory ||
        currentMinPrice ||
        currentMaxPrice ||
        filters.search,
      ),
    [
      currentPetType,
      currentCategory,
      currentMinPrice,
      currentMaxPrice,
      filters.search,
    ],
  );

  const clearAll = () => {
    const params = new URLSearchParams();
    if (filters.sort && filters.sort !== 'relevance') {
      params.set('sort', filters.sort);
    }
    const qs = params.toString();
    router.replace(qs.length > 0 ? `/products?${qs}` : '/products', {
      scroll: false,
    });
    if (onAfterChange) onAfterChange();
  };

  return (
    <div className={cn('flex flex-col gap-7', className)}>
      <fieldset className="flex flex-col gap-3">
        <legend className="font-display text-base tracking-[-0.02em] text-warm-900">
          Pet type
        </legend>
        <div className="flex flex-col gap-2">
          {PET_TYPES.map((value) => {
            const checked = currentPetType === value;
            return (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-warm-900"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePetType(value)}
                  className="size-4 rounded border-warm-300 text-brand-400 accent-brand-400 focus:ring-2 focus:ring-brand-400"
                />
                {PET_TYPE_LABEL[value]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-display text-base tracking-[-0.02em] text-warm-900">
          Category
        </legend>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((value) => {
            const checked = currentCategory === value;
            return (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2.5 font-body text-sm text-warm-900"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(value)}
                  className="size-4 rounded border-warm-300 text-brand-400 accent-brand-400 focus:ring-2 focus:ring-brand-400"
                />
                {CATEGORY_LABEL[value]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-display text-base tracking-[-0.02em] text-warm-900">
          Price (USD)
        </legend>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs text-warm-600">Min</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              placeholder="0"
              value={currentMinPrice}
              onChange={(event) =>
                handlePriceChange('minPrice', event.target.value)
              }
              className="w-full rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs text-warm-600">Max</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              placeholder="100"
              value={currentMaxPrice}
              onChange={(event) =>
                handlePriceChange('maxPrice', event.target.value)
              }
              className="w-full rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </label>
        </div>
      </fieldset>

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={clearAll}
          className="self-start font-body text-sm text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
