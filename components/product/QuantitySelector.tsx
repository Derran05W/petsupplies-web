'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  inStock: boolean;
  stockCount: number;
}

/**
 * Quantity stepper + "Add to cart" button. Phase 5 wires the click handler
 * to the Zustand cart store. For now it just keeps local quantity state
 * so the UI is fully interactive.
 *
 * Constraints:
 *   - min quantity = 1
 *   - max quantity = `stockCount` (clamped on every increment)
 *   - whole component disabled when `!inStock`
 */
export function QuantitySelector({
  inStock,
  stockCount,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-body text-sm text-warm-600">Quantity</span>
        <div className="inline-flex items-center rounded-lg border border-warm-300 bg-white">
          <button
            type="button"
            onClick={decrement}
            disabled={decDisabled}
            aria-label="Decrease quantity"
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-l-lg text-warm-900 transition-colors',
              decDisabled
                ? 'cursor-not-allowed text-warm-400'
                : 'hover:bg-warm-100',
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
            className="h-10 w-12 border-x border-warm-300 bg-white text-center font-body text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-400 disabled:bg-warm-100 disabled:text-warm-400"
          />
          <button
            type="button"
            onClick={increment}
            disabled={incDisabled}
            aria-label="Increase quantity"
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-r-lg text-warm-900 transition-colors',
              incDisabled
                ? 'cursor-not-allowed text-warm-400'
                : 'hover:bg-warm-100',
            )}
          >
            <Plus size={14} aria-hidden />
          </button>
        </div>
        {inStock && stockCount <= 10 ? (
          <span className="font-body text-xs text-warm-600">
            Only {stockCount} left
          </span>
        ) : null}
      </div>

      <button
        type="button"
        disabled={!inStock}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-body text-sm font-medium transition-colors sm:w-auto sm:min-w-[14rem]',
          inStock
            ? 'bg-brand-400 text-white hover:bg-brand-500'
            : 'cursor-not-allowed bg-warm-200 text-warm-600',
        )}
      >
        <ShoppingBag size={16} aria-hidden />
        {inStock ? 'Add to cart' : 'Out of stock'}
      </button>
    </div>
  );
}
