'use client';

import { Heart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  useAddWishlistMutation,
  useIsWishlisted,
  useRemoveWishlistMutation,
} from '@/hooks/useWishlist';
import type { Product } from '@/types/product';

interface WishlistButtonProps {
  product: Product;
  variant?: 'overlay' | 'inline';
}

/**
 * Toggle wishlist membership with optimistic updates. Signed-out users are
 * redirected to `/login?redirect=<currentPath>` — no silent failure.
 */
export function WishlistButton({
  product,
  variant = 'overlay',
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isWishlisted = useIsWishlisted(product.id);
  const addMutation = useAddWishlistMutation();
  const removeMutation = useRemoveWishlistMutation();

  const busy = addMutation.isPending || removeMutation.isPending;

  const redirectToLogin = () => {
    const redirect =
      pathname && pathname.length > 0
        ? `?redirect=${encodeURIComponent(pathname)}`
        : '';
    router.push(`/login${redirect}`);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) return;

    if (!user) {
      redirectToLogin();
      return;
    }

    if (busy) return;

    if (isWishlisted) {
      removeMutation.mutate(product.id);
    } else {
      addMutation.mutate({ productId: product.id, product });
    }
  };

  const label = isWishlisted ? 'Remove from wishlist' : 'Save to wishlist';

  const buttonClass =
    variant === 'overlay'
      ? cn(
          'absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full border border-warm-200 bg-surface-card/95 shadow-sm backdrop-blur-sm transition-colors',
          'hover:bg-surface-card hover:border-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
          busy ? 'cursor-wait opacity-80' : '',
        )
      : cn(
          'inline-flex items-center justify-center gap-2 rounded-lg border border-warm-300 bg-surface-card px-4 py-2.5 font-body text-sm font-medium text-warm-900 transition-colors',
          'hover:border-brand-300 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
          busy ? 'cursor-wait opacity-80' : '',
        );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || busy}
      aria-pressed={isWishlisted}
      aria-busy={busy}
      aria-label={label}
      title={label}
      className={buttonClass}
    >
      <Heart
        size={variant === 'overlay' ? 18 : 20}
        aria-hidden
        className={cn(
          'transition-colors',
          isWishlisted
            ? 'fill-brand-500 text-brand-500'
            : 'fill-transparent text-warm-600',
        )}
      />
      {variant === 'inline' ? (
        <span>{isWishlisted ? 'Saved' : 'Save'}</span>
      ) : null}
    </button>
  );
}
