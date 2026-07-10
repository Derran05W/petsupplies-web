import { type Product } from '@/types/product';
import { Button, PetIcon, ProductCard, Reveal } from '@/components/ui';
import { TILE_TONES } from '@/components/ui/tones';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface ProductGridProps {
  products: Product[];
  emptyHref?: string;
}

/** Cap the stagger so deep grids don't make later rows feel sluggish. */
const MAX_REVEAL_DELAY_MS = 280;

/**
 * Listing grid of boutique product cards — same auto-fill columns, tonal
 * tile cycle, and staggered reveal as the homepage featured grid, plus a
 * wishlist heart in each card's tile. Renders a panel-toned empty state
 * with a "Clear filters" CTA when `products` is empty.
 */
export function ProductGrid({
  products,
  emptyHref = '/products',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card bg-panel px-6 py-16 text-center">
        <span
          aria-hidden
          className="inline-flex size-16 items-center justify-center rounded-full bg-tile-sage text-tile-sage-ink"
        >
          <PetIcon name="paw" className="size-8" />
        </span>
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          Nothing found yet.
        </h2>
        <p className="max-w-md font-body text-sm leading-body text-ink-secondary">
          We couldn&apos;t find any products that match these filters. Try
          loosening up the search, or clear all filters to start over.
        </p>
        <Button href={emptyHref}>Clear filters</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-6 gap-y-9">
      {products.map((product, index) => (
        <Reveal
          key={product.id}
          delay={Math.min(index * 70, MAX_REVEAL_DELAY_MS)}
        >
          <ProductCard
            product={product}
            tone={TILE_TONES[index % TILE_TONES.length]!}
            overlaySlot={<WishlistButton product={product} variant="overlay" />}
          />
        </Reveal>
      ))}
    </div>
  );
}
