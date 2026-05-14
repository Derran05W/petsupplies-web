'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
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
    <article className="flex flex-col rounded-xl border border-warm-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-warm-100"
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>

      <Link
        href={`/products/${product.slug}`}
        className="font-display text-lg leading-snug tracking-[-0.02em] text-warm-900 hover:text-brand-600"
      >
        {product.name}
      </Link>

      <p className="mt-2 font-body text-sm font-medium text-warm-900">
        {formatPrice(product.priceCents)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleMoveToCart}
          disabled={!canMoveToCart || busyRemove}
          className={cn(
            'inline-flex min-w-[8rem] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-body text-sm font-medium transition-colors',
            canMoveToCart
              ? 'bg-brand-400 text-white hover:bg-brand-500'
              : 'cursor-not-allowed bg-warm-200 text-warm-600',
          )}
        >
          <ShoppingBag size={16} aria-hidden />
          {canMoveToCart ? 'Move to cart' : 'Out of stock'}
        </button>

        <button
          type="button"
          onClick={handleRemove}
          disabled={busyRemove}
          aria-busy={busyRemove}
          aria-label={`Remove ${product.name} from wishlist`}
          className="text-warm-700 inline-flex items-center justify-center gap-2 rounded-lg border border-warm-300 bg-white px-4 py-2.5 font-body text-sm font-medium transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-800 disabled:opacity-60"
        >
          <Trash2 size={16} aria-hidden />
          Remove
        </button>
      </div>
    </article>
  );
}
