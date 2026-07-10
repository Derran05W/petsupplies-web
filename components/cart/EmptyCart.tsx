import { Button, PetIcon } from '@/components/ui';

interface EmptyCartProps {
  /**
   * Variant. The drawer is constrained vertically so the empty state
   * paints with less padding; the full /cart page gets the airy version.
   */
  variant?: 'page' | 'drawer';
  /**
   * If the empty state lives inside the drawer, the "Browse products" CTA
   * should also close the drawer on click. Provided by the drawer wrapper.
   */
  onBrowse?: () => void;
}

export function EmptyCart({ variant = 'page', onBrowse }: EmptyCartProps) {
  const isDrawer = variant === 'drawer';

  return (
    <div
      className={
        isDrawer
          ? 'flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center'
          : 'flex flex-col items-center justify-center gap-5 rounded-card bg-panel px-6 py-16 text-center md:py-24'
      }
    >
      <span
        aria-hidden
        className="inline-flex size-16 items-center justify-center rounded-full bg-tile-amber text-tile-amber-ink"
      >
        <PetIcon name="bowl" className="size-8" />
      </span>
      <h2 className="font-display text-2xl tracking-[-0.01em] text-ink md:text-3xl">
        Your cart is feeling empty.
      </h2>
      <p className="max-w-sm font-body text-sm leading-body text-ink-secondary">
        Once you find something tasty, it&apos;ll show up here. Browse the shop
        to get started.
      </p>
      <Button href="/products" onClick={onBrowse}>
        Browse products
      </Button>
    </div>
  );
}
