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

/** Pet types shoppers can filter by — fish and bird are no longer carried. */
const PET_TYPES: ReadonlyArray<PetType> = [
  'dog',
  'cat',
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

const CHECKBOX_CLASSES =
  'size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine';

const PRICE_INPUT_CLASSES =
  'w-full rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';

/**
 * URL-driven filter group used by both the desktop sidebar and the mobile
 * bottom-sheet drawer. Reads current state from `useSearchParams`, pushes
 * updates with `router.replace` (no history entry per filter tweak).
 *
 * Pet type is single-value; category is genuine multi-select (a product
 * matches if it belongs to any checked category). Clicking an active pet
 * type clears it; category checkboxes toggle independently.
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
  const currentCategories = useMemo(
    () => filters.categories ?? [],
    [filters.categories],
  );
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
      const current = next.categories ?? [];
      const nextCategories = current.includes(value)
        ? current.filter((c) => c !== value)
        : [...current, value];
      if (nextCategories.length > 0) {
        next.categories = nextCategories;
      } else {
        delete next.categories;
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
        currentCategories.length > 0 ||
        currentMinPrice ||
        currentMaxPrice ||
        filters.search,
      ),
    [
      currentPetType,
      currentCategories,
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
    <div className={cn('flex flex-col gap-8', className)}>
      <fieldset className="flex flex-col gap-3 border-t border-line pt-5">
        <legend className="float-left font-body text-kicker uppercase text-pine">
          Pet type
        </legend>
        <div className="flex flex-col gap-2.5 pt-2">
          {PET_TYPES.map((value) => {
            const checked = currentPetType === value;
            return (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 font-body text-sm transition-colors duration-fast',
                  checked ? 'text-ink' : 'text-ink-secondary hover:text-ink',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePetType(value)}
                  className={CHECKBOX_CLASSES}
                />
                {PET_TYPE_LABEL[value]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-line pt-5">
        <legend className="float-left font-body text-kicker uppercase text-pine">
          Category
        </legend>
        <div className="flex flex-col gap-2.5 pt-2">
          {CATEGORIES.map((value) => {
            const checked = currentCategories.includes(value);
            return (
              <label
                key={value}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 font-body text-sm transition-colors duration-fast',
                  checked ? 'text-ink' : 'text-ink-secondary hover:text-ink',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(value)}
                  className={CHECKBOX_CLASSES}
                />
                {CATEGORY_LABEL[value]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 border-t border-line pt-5">
        <legend className="float-left font-body text-kicker uppercase text-pine">
          Price (CAD)
        </legend>
        <div className="flex flex-col gap-2.5 pt-2">
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs text-ink-muted">Min</span>
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
              className={PRICE_INPUT_CLASSES}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs text-ink-muted">Max</span>
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
              className={PRICE_INPUT_CLASSES}
            />
          </label>
        </div>
      </fieldset>

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={clearAll}
          className="self-start border-b border-ink pb-0.5 font-body text-micro uppercase text-ink transition-opacity duration-fast hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
