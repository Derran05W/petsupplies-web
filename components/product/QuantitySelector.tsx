'use client';

import { useEffect, useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCartActions, useCartHasHydrated } from '@/hooks/useCart';
import { type Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface QuantitySelectorProps {
  product: Product;
  /** Rendered between the quantity stepper and the Add to cart button. */
  preAction?: React.ReactNode;
}

const ADDED_FEEDBACK_MS = 1500;

/**
 * Quantity stepper + "Add to cart" CTA on the PDP.
 *
 * Constraints:
 *   - min quantity = 1
 *   - max quantity = `product.stockCount`
 *   - whole component disabled when `!product.inStock`
 *   - Add button disabled until the cart store has rehydrated, so a
 *     pre-hydration click can't race the persisted state and create a
 *     duplicate add when localStorage finally loads.
 *   - Successful add flips a 1.5s "Added!" confirmation on the button.
 */
export function QuantitySelector({
  product,
  preAction,
}: QuantitySelectorProps) {
  const { add } = useCartActions();
  const hasHydrated = useCartHasHydrated();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const { inStock, stockCount } = product;
  const max = Math.max(1, stockCount);
  const decDisabled = !inStock || quantity <= 1;
  const incDisabled = !inStock || quantity >= max;

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(max, q + 1));

  const handleChange = (raw: string) => {
    const next = Number.parseInt(raw, 10);
    if (!Number.isFinite(next)) return;
    setQuantity(Math.max(1, Math.min(max, next)));
  };

  const handleAdd = () => {
    if (!inStock || !hasHydrated) return;
    add(product, quantity);
    setJustAdded(true);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS);
  };

  const buttonDisabled = !inStock || !hasHydrated;
  const buttonLabel = !inStock
    ? 'Out of stock'
    : justAdded
      ? 'Added!'
      : 'Add to cart';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-body text-micro uppercase text-ink">
          Quantity
        </span>
        <div className="inline-flex items-center rounded-pill border border-line">
          <button
            type="button"
            onClick={decrement}
            disabled={decDisabled}
            aria-label="Decrease quantity"
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-l-pill transition-colors duration-fast',
              decDisabled
                ? 'cursor-not-allowed text-ink-faint opacity-50'
                : 'text-ink hover:bg-panel',
            )}
          >
            <Minus size={14} aria-hidden />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            value={quantity}
            disabled={!inStock}
            onChange={(event) => handleChange(event.target.value)}
            aria-label="Quantity"
            className="h-10 w-12 border-x border-line bg-transparent text-center font-body text-sm text-ink [appearance:textfield] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pine disabled:bg-panel disabled:text-ink-faint [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={increment}
            disabled={incDisabled}
            aria-label="Increase quantity"
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-r-pill transition-colors duration-fast',
              incDisabled
                ? 'cursor-not-allowed text-ink-faint opacity-50'
                : 'text-ink hover:bg-panel',
            )}
          >
            <Plus size={14} aria-hidden />
          </button>
        </div>
        {inStock && stockCount <= 10 ? (
          <span className="font-body text-xs text-ink-muted">
            Only {stockCount} left
          </span>
        ) : null}
      </div>

      {preAction}

      <Button
        onClick={handleAdd}
        disabled={buttonDisabled}
        aria-live="polite"
        className={cn(
          'w-full sm:w-auto sm:min-w-[14rem]',
          !inStock
            ? 'cursor-not-allowed border-line bg-panel text-ink-faint hover:translate-y-0 hover:border-line hover:bg-panel'
            : '',
          !hasHydrated && inStock ? 'opacity-70' : '',
        )}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
