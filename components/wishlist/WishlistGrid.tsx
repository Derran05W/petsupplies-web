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
        className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center"
      >
        <p className="font-body text-sm text-red-900">
          {error.message || 'Could not load your wishlist.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mx-auto inline-flex items-center justify-center rounded-lg bg-red-700 px-5 py-2.5 font-body text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
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
