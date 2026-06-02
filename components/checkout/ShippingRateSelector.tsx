'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { quoteShipping } from '@/lib/api/shipping';
import { getBrowserAccessToken } from '@/lib/supabase/browser-access-token';
import type {
  ShippingRateOption,
  ShippingSelectionInput,
} from '@/types/shipping';
import type { ShippingAddressInput } from '@/lib/checkout/schemas';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface ShippingRateSelectorProps {
  address: Partial<ShippingAddressInput>;
  disabled?: boolean;
  hideWhenFreeShipping?: boolean;
  onSelectionChange: (
    selection: ShippingSelectionInput | null,
    amountCents: number | null,
  ) => void;
}

function isCompleteCanadianAddress(
  address: Partial<ShippingAddressInput>,
): address is ShippingAddressInput & { country: 'CA' } {
  return (
    address.country === 'CA' &&
    Boolean(address.line1?.trim()) &&
    Boolean(address.city?.trim()) &&
    Boolean(address.state?.trim()) &&
    Boolean(address.postalCode?.trim())
  );
}

export function ShippingRateSelector({
  address,
  disabled = false,
  hideWhenFreeShipping = false,
  onSelectionChange,
}: ShippingRateSelectorProps) {
  const [options, setOptions] = useState<ShippingRateOption[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addressKey = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].join('|');

  useEffect(() => {
    if (hideWhenFreeShipping || disabled || address.country !== 'CA') {
      setOptions([]);
      setSelectedCode(null);
      onSelectionChange(null, null);
      return;
    }

    if (!isCompleteCanadianAddress(address)) {
      setOptions([]);
      setSelectedCode(null);
      onSelectionChange(null, null);
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = await getBrowserAccessToken();
        if (!accessToken) {
          setError('Sign in to see shipping rates.');
          return;
        }

        const quote = await quoteShipping(
          {
            line1: address.line1,
            ...(address.line2 ? { line2: address.line2 } : {}),
            city: address.city,
            region: address.state,
            postalCode: address.postalCode,
            country: 'CA',
          },
          { accessToken },
        );

        if (cancelled) return;

        setOptions(quote.options);
        const first = quote.options[0] ?? null;
        setSelectedCode(first?.serviceCode ?? null);

        if (first) {
          onSelectionChange(
            {
              selectionToken: first.selectionToken,
              serviceCode: first.serviceCode,
              amountCents: first.amountCents,
              line1: address.line1,
              ...(address.line2 ? { line2: address.line2 } : {}),
              city: address.city,
              region: address.state,
              postalCode: address.postalCode,
              country: 'CA',
            },
            first.amountCents,
          );
        } else {
          onSelectionChange(null, null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setError(err.message || 'Could not load shipping rates.');
        } else {
          setError('Could not load shipping rates.');
        }
        setOptions([]);
        onSelectionChange(null, null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by addressKey
  }, [addressKey, hideWhenFreeShipping, disabled]);

  if (address.country !== 'CA' || hideWhenFreeShipping) {
    return null;
  }

  if (!isCompleteCanadianAddress(address)) {
    return (
      <p className="font-body text-sm text-warm-600">
        Enter your full Canadian address to see shipping options.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 font-body text-sm text-warm-600">
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Loading shipping rates…
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="font-body text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (options.length === 0) {
    return (
      <p className="font-body text-sm text-warm-600">
        No shipping rates available for this address.
      </p>
    );
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 font-display text-lg tracking-[-0.02em] text-warm-900">
        Shipping method
      </legend>
      {options.map((option) => {
        const checked = selectedCode === option.serviceCode;
        return (
          <label
            key={option.serviceCode}
            className={cn(
              'flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors',
              checked
                ? 'border-brand-400 bg-brand-50'
                : 'border-warm-200 bg-surface-card hover:border-warm-300',
            )}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="shippingRate"
                checked={checked}
                onChange={() => {
                  setSelectedCode(option.serviceCode);
                  onSelectionChange(
                    {
                      selectionToken: option.selectionToken,
                      serviceCode: option.serviceCode,
                      amountCents: option.amountCents,
                      line1: address.line1!,
                      ...(address.line2 ? { line2: address.line2 } : {}),
                      city: address.city!,
                      region: address.state!,
                      postalCode: address.postalCode!,
                      country: 'CA',
                    },
                    option.amountCents,
                  );
                }}
                className="size-4 accent-brand-500"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-body text-sm font-medium text-warm-900">
                  {option.serviceName}
                </span>
                {option.estimatedDeliveryDays !== undefined ? (
                  <span className="font-body text-xs text-warm-600">
                    Est. {option.estimatedDeliveryDays} business days
                  </span>
                ) : null}
              </span>
            </span>
            <span className="font-body text-sm font-medium text-warm-900">
              {option.amountCents === 0
                ? 'Free'
                : formatPrice(option.amountCents)}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
