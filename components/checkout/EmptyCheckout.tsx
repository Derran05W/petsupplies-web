import { Button, PetIcon, TONE_CLASSES } from '@/components/ui';

/**
 * Empty-cart guard for `/checkout`. We don't redirect server-side because
 * the cart only exists on the client — a `redirect('/cart')` would loop
 * once the user lands on `/cart` (which itself reads the same store).
 *
 * Boutique empty state — PetIcon on a tonal tile, matching `<PetsEmpty />`.
 */
export function EmptyCheckout() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-line bg-paper px-6 py-16 text-center md:py-24">
      <span
        aria-hidden
        className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.amber}`}
      >
        <PetIcon name="bowl" className="size-8" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-title text-ink">
          Nothing to check out yet.
        </h2>
        <p className="max-w-sm font-body text-sm leading-body text-ink-secondary">
          Add a few things to your cart and we&apos;ll meet you back here.
        </p>
      </div>
      <Button href="/products" className="mt-2 px-6 py-2.5">
        Browse products
      </Button>
    </div>
  );
}
