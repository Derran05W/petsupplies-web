import { Button, PetIcon, TONE_CLASSES } from '@/components/ui';

/**
 * Empty wishlist — mirrors {@link OrdersEmpty} pattern.
 */
export function WishlistEmpty() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-paper px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.clay}`}
      >
        <PetIcon name="yarn" className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          Your wishlist is empty
        </h2>
        <p className="max-w-sm font-body text-sm leading-body text-ink-secondary">
          Save products you love — they&apos;ll show up here for quick access
          and easy checkout.
        </p>
      </div>
      <Button variant="ghost" href="/products" className="mt-2 px-6 py-2.5">
        Browse products
      </Button>
    </section>
  );
}
