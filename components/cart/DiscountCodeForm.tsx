'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { discountRejectMessage } from '@/lib/cart/discount-messages';
import {
  useCartActions,
  useCartIsServerMode,
  useCartTotals,
} from '@/hooks/useCart';
import { cn } from '@/lib/utils';

interface DiscountCodeFormProps {
  className?: string;
  compact?: boolean;
}

export function DiscountCodeForm({
  className,
  compact = false,
}: DiscountCodeFormProps) {
  const isServerMode = useCartIsServerMode();
  const totals = useCartTotals();
  const { applyDiscount, removeDiscount } = useCartActions();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isServerMode) {
    return (
      <p className={cn('font-body text-xs text-ink-muted', className)}>
        Sign in to apply a discount code at checkout.
      </p>
    );
  }

  const appliedCode = totals?.discountCode;
  const invalidReason = totals?.discountInvalidReason;

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      await applyDiscount(trimmed);
      setCode('');
    } catch (err) {
      if (err instanceof ApiError) {
        const reason = (err.validationErrors as { reason?: string } | undefined)
          ?.reason;
        setError(
          err.message ||
            (reason ? discountRejectMessage(reason as never) : 'Invalid code'),
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not apply that code.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError(null);
    try {
      await removeDiscount();
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {!compact ? (
        <p className="font-body text-micro uppercase text-ink">Discount code</p>
      ) : null}

      {invalidReason ? (
        <p role="status" className="font-body text-xs text-amber">
          {totals?.discountInvalidCode
            ? `"${totals.discountInvalidCode}" — ${discountRejectMessage(invalidReason)}`
            : discountRejectMessage(invalidReason)}
        </p>
      ) : null}

      {appliedCode ? (
        <div className="flex items-center justify-between gap-3 rounded-tile border border-pine bg-paper px-3 py-2">
          <span className="font-body text-sm text-ink">
            <span className="font-semibold">{appliedCode}</span> applied
          </span>
          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 font-body text-micro uppercase text-pine transition-opacity duration-fast hover:opacity-70"
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" aria-hidden />
            ) : null}
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            aria-label="Discount code"
            disabled={busy}
            className="min-w-0 flex-1 rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={busy || code.trim().length === 0}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-pill border border-ink bg-transparent px-5 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              'Apply'
            )}
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="font-body text-xs text-danger-solid">
          {error}
        </p>
      ) : null}
    </div>
  );
}
