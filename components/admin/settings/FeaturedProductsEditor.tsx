'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, Loader2, Search } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import { useAdminProductsQuery } from '@/hooks/useAdminProducts';
import {
  useFeaturedProductsQuery,
  useReplaceFeaturedProductsMutation,
} from '@/hooks/useSiteFeaturedProducts';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from './admin-settings-form-styles';
import { cn } from '@/lib/utils';

const MAX_FEATURED = 8;

export function FeaturedProductsEditor() {
  const {
    data: featured = [],
    isPending: featuredLoading,
    error: featuredError,
  } = useFeaturedProductsQuery();
  const replaceMutation = useReplaceFeaturedProductsMutation();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: catalog, isPending: catalogLoading } = useAdminProductsQuery({
    page: 1,
    search,
    stockState: 'all',
  });

  useEffect(() => {
    if (featuredLoading || initialized) return;
    setProductIds(featured.map((product) => product.id));
    setInitialized(true);
  }, [featured, featuredLoading, initialized]);

  const catalogProducts = catalog?.products ?? [];
  const selectedSet = new Set(productIds);

  function productById(id: string) {
    return (
      featured.find((product) => product.id === id) ??
      catalogProducts.find((product) => product.id === id)
    );
  }

  function toggleProduct(id: string) {
    setSuccess(null);
    setProductIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      if (current.length >= MAX_FEATURED) return current;
      return [...current, id];
    });
  }

  function moveProduct(id: string, direction: -1 | 1) {
    setSuccess(null);
    setProductIds((current) => {
      const index = current.indexOf(id);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const temp = copy[index]!;
      copy[index] = copy[nextIndex]!;
      copy[nextIndex] = temp;
      return copy;
    });
  }

  if (featuredLoading) {
    return (
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading featured products…
      </p>
    );
  }

  if (featuredError) {
    return (
      <p className="font-body text-sm text-danger-solid" role="alert">
        {adminApiErrorMessage(featuredError)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-xl tracking-[-0.01em] text-ink">
          Featured products
        </h3>
        <p className="mt-1 font-body text-sm text-ink-secondary">
          Choose up to {MAX_FEATURED} products for the homepage grid. Order
          matches left-to-right on the storefront.
        </p>
      </div>

      {productIds.length > 0 ? (
        <ol className="flex flex-col">
          {productIds.map((id, index) => {
            const product = productById(id);
            if (!product) {
              return (
                <li
                  key={id}
                  className="border-b border-line px-1 py-3 font-body text-sm text-ink-muted last:border-0"
                >
                  Product {id} (reload to refresh details)
                </li>
              );
            }

            const image =
              product.images.find((img) => img.isPrimary) ?? product.images[0];

            return (
              <li
                key={id}
                className="flex items-center gap-3 border-b border-line px-1 py-2.5 last:border-0"
              >
                <span className="w-6 shrink-0 text-center font-body text-xs text-ink-faint">
                  {index + 1}
                </span>
                {image ? (
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-tile border border-line bg-panel">
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized={image.url.startsWith('http')}
                    />
                  </div>
                ) : null}
                <span className="min-w-0 flex-1 truncate font-body text-sm text-ink">
                  {product.name}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${product.name} up`}
                    disabled={index === 0}
                    onClick={() => moveProduct(id, -1)}
                    className="inline-flex size-8 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
                  >
                    <ArrowUp size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${product.name} down`}
                    disabled={index === productIds.length - 1}
                    onClick={() => moveProduct(id, 1)}
                    className="inline-flex size-8 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
                  >
                    <ArrowDown size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleProduct(id)}
                    className="px-2 py-1 font-body text-micro uppercase text-danger-solid transition-opacity duration-fast hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-solid"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="font-body text-sm text-ink-muted">
          No featured products selected. The homepage shows placeholder products
          until you save a curated set.
        </p>
      )}

      <div>
        <label htmlFor="featured-search" className={settingsLabelBase}>
          Add products
        </label>
        <div className="relative mb-3">
          <Search
            size={14}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            id="featured-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search catalogue…"
            className={cn(settingsInputBase, 'pl-9')}
          />
        </div>

        {catalogLoading ? (
          <p className="font-body text-sm text-ink-secondary">Searching…</p>
        ) : (
          <ul className="max-h-64 space-y-1 overflow-y-auto rounded-tile border border-line p-2">
            {catalogProducts.map((product) => {
              const checked = selectedSet.has(product.id);
              const disabled = !checked && productIds.length >= MAX_FEATURED;
              return (
                <li key={product.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-tile px-2 py-2 transition-colors duration-fast hover:bg-panel',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleProduct(product.id)}
                      className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                    />
                    <span className="truncate font-body text-sm text-ink">
                      {product.name}
                    </span>
                  </label>
                </li>
              );
            })}
            {catalogProducts.length === 0 ? (
              <li className="px-2 py-3 font-body text-sm text-ink-muted">
                No products match your search.
              </li>
            ) : null}
          </ul>
        )}
      </div>

      {submitError ? (
        <p className="font-body text-sm text-danger-solid" role="alert">
          {submitError}
        </p>
      ) : null}

      {success ? (
        <p className="font-body text-sm text-pine" role="status">
          {success}
        </p>
      ) : null}

      <div>
        <button
          type="button"
          disabled={replaceMutation.isPending}
          onClick={async () => {
            setSubmitError(null);
            setSuccess(null);
            try {
              await replaceMutation.mutateAsync(productIds);
              setSuccess(settingsSuccessMessage);
            } catch (err) {
              setSubmitError(adminApiErrorMessage(err));
            }
          }}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
        >
          {replaceMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : null}
          Save featured products
        </button>
      </div>
    </div>
  );
}
