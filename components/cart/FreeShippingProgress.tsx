'use client';

import { Truck } from 'lucide-react';
import { useFreeShippingProgress } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface FreeShippingProgressProps {
  /**
   * `compact` is used inside the cart drawer header — single-line layout
   * with a thinner bar. The full version (used in CartSummary) shows an
   * icon + heading + bar + microcopy stacked.
   */
  compact?: boolean;
  className?: string;
}

export function FreeShippingProgress({
  compact = false,
  className,
}: FreeShippingProgressProps) {
  const { progress, qualifies, remainingCents } = useFreeShippingProgress();

  const microcopy = qualifies
    ? 'You qualify for free shipping.'
    : `${formatPrice(remainingCents)} away from free shipping.`;

  if (compact) {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <p className="font-body text-xs text-warm-600">{microcopy}</p>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-warm-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Free shipping progress"
        >
          <div
            className="h-full rounded-full bg-brand-400 transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="inline-flex items-center gap-2 font-body text-sm text-warm-900">
        <Truck size={14} aria-hidden className="text-brand-600" />
        <span>{microcopy}</span>
      </p>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-warm-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Free shipping progress"
      >
        <div
          className="h-full rounded-full bg-brand-400 transition-all duration-500 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
