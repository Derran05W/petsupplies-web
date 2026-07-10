import { Button, PetIcon, TONE_CLASSES } from '@/components/ui';

/**
 * Empty-state panel for the orders list. `role="status"` so SR users
 * understand this is a "nothing yet" state, not an error.
 */
export function OrdersEmpty() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-card border border-line bg-paper px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.amber}`}
      >
        <PetIcon name="bone" className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          No orders yet
        </h2>
        <p className="max-w-sm font-body text-sm leading-body text-ink-secondary">
          When you place your first order, it&apos;ll appear here so you can
          track delivery and reorder favourites in a tap.
        </p>
      </div>
      <Button variant="ghost" href="/products" className="mt-2 px-6 py-2.5">
        Browse products
      </Button>
    </section>
  );
}
