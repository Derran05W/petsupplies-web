'use client';

import { useState } from 'react';
import { Loader2, Tag, X } from 'lucide-react';
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
      <p className={cn('font-body text-xs text-warm-600', className)}>
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
        <p className="inline-flex items-center gap-2 font-body text-sm font-medium text-warm-900">
          <Tag size={14} aria-hidden className="text-brand-600" />
          Discount code
        </p>
      ) : null}

      {invalidReason ? (
        <p role="status" className="font-body text-xs text-amber-700">
          {totals?.discountInvalidCode
            ? `"${totals.discountInvalidCode}" — ${discountRejectMessage(invalidReason)}`
            : discountRejectMessage(invalidReason)}
        </p>
      ) : null}

      {appliedCode ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
          <span className="font-body text-sm text-warm-900">
            <span className="font-medium">{appliedCode}</span> applied
          </span>
          <button
            type="button"
            onClick={() => void handleRemove()}
            disabled={busy}
            className="hover:text-brand-800 inline-flex items-center gap-1 font-body text-xs font-medium text-brand-700"
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <X size={12} />
            )}
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
            className="min-w-0 flex-1 rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={busy || code.trim().length === 0}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-warm-300 bg-warm-100 px-4 py-2 font-body text-sm font-medium text-warm-900 transition-colors hover:bg-warm-200 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="font-body text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
