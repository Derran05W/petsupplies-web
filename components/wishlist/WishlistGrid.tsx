'use client';

import { useWishlistQuery } from '@/hooks/useWishlist';
import { WishlistEmpty } from './WishlistEmpty';
import { WishlistItemCard } from './WishlistItemCard';
import { WishlistSkeleton } from './WishlistSkeleton';

/**
 * Hydrated wishlist grid — reads TanStack Query cache (seeded from RSC via
 * {@link HydrationBoundary} on `/account/wishlist`).
 */
export function WishlistGrid() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useWishlistQuery({ enabled: true });

  if (isPending && data === undefined) {
    return <WishlistSkeleton />;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-4 rounded-card border border-danger-border bg-danger-surface px-6 py-8 text-center"
      >
        <p className="font-body text-sm text-danger-solid">
          {error.message || 'Could not load your wishlist.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mx-auto inline-flex cursor-pointer items-center justify-center rounded-pill border border-danger-solid bg-danger-solid px-6 py-2.5 font-body text-micro uppercase text-danger-on-solid transition-all duration-base ease-soft hover:border-danger-solid-hover hover:bg-danger-solid-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Try again
        </button>
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return <WishlistEmpty />;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li key={item.product.id}>
          <WishlistItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
