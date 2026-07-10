'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import type { WishlistItem } from '@/types/wishlist';
import { useCartActions } from '@/hooks/useCart';
import { useRemoveWishlistMutation } from '@/hooks/useWishlist';

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

interface WishlistItemCardProps {
  item: WishlistItem;
}

function pickPrimaryImage(item: WishlistItem): { url: string; alt: string } {
  const { product } = item;
  const primary = product.images.find((image) => image.isPrimary);
  const first = product.images[0];
  const chosen = primary ?? first;
  if (!chosen) {
    return { url: FALLBACK_IMAGE, alt: product.name };
  }
  return { url: chosen.url, alt: chosen.alt || product.name };
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const { product } = item;
  const { url: imageUrl, alt: imageAlt } = pickPrimaryImage(item);
  const { add } = useCartActions();
  const removeMutation = useRemoveWishlistMutation();

  const canMoveToCart = product.inStock && product.stockCount > 0;
  const busyRemove = removeMutation.isPending;

  const handleMoveToCart = () => {
    if (!canMoveToCart) return;
    add(product, 1);
    removeMutation.mutate(product.id);
  };

  const handleRemove = () => {
    if (busyRemove) return;
    removeMutation.mutate(product.id);
  };

  return (
    <article className="flex flex-col rounded-card border border-line bg-paper p-4 transition-colors duration-base ease-soft hover:border-ink">
      <Link
        href={`/products/${product.slug}`}
        className="relative mb-3 aspect-square overflow-hidden rounded-tile bg-panel"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-slow ease-soft hover:scale-105 motion-reduce:transform-none"
        />
      </Link>

      <Link
        href={`/products/${product.slug}`}
        className="font-display text-xl leading-snug tracking-[-0.01em] text-ink transition-opacity duration-fast hover:opacity-70"
      >
        {product.name}
      </Link>

      <p className="mt-2 font-body text-sm font-medium text-ink">
        {formatPrice(product.priceCents)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleMoveToCart}
          disabled={!canMoveToCart || busyRemove}
          className={cn(
            'inline-flex min-w-[8rem] flex-1 items-center justify-center gap-2 rounded-pill border px-4 py-2.5 font-body text-micro uppercase transition-all duration-base ease-soft',
            canMoveToCart
              ? 'cursor-pointer border-ink bg-ink text-paper hover:border-pine hover:bg-pine disabled:cursor-not-allowed disabled:opacity-50'
              : 'cursor-not-allowed border-line bg-panel text-ink-faint',
          )}
        >
          {canMoveToCart ? 'Move to cart' : 'Out of stock'}
        </button>

        <button
          type="button"
          onClick={handleRemove}
          disabled={busyRemove}
          aria-busy={busyRemove}
          aria-label={`Remove ${product.name} from wishlist`}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-line bg-transparent px-4 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:border-danger-solid hover:text-danger-solid disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
