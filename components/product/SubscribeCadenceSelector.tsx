'use client';

import {
  SUBSCRIPTION_INTERVAL_LABEL,
  type SubscriptionInterval,
} from '@/types/subscription';
import { cn } from '@/lib/utils';

interface SubscribeCadenceSelectorProps {
  value: SubscriptionInterval;
  onChange: (next: SubscriptionInterval) => void;
  /** Subset supported for this catalog item; must be non-empty. */
  allowed: SubscriptionInterval[];
  disabled?: boolean;
}

export function SubscribeCadenceSelector({
  value,
  onChange,
  allowed,
  disabled = false,
}: SubscribeCadenceSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-warm-800 font-body text-sm font-medium">
        Delivery cadence
      </legend>
      <div
        role="radiogroup"
        aria-label="Subscribe and save cadence"
        className="flex flex-col gap-2"
      >
        {allowed.map((interval) => {
          const selected = interval === value;
          return (
            <label
              key={interval}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 font-body text-sm transition-colors',
                selected
                  ? 'border-brand-400 bg-brand-50 text-warm-900'
                  : 'text-warm-700 border-warm-200 bg-white hover:border-warm-300',
                disabled ? 'cursor-not-allowed opacity-60' : '',
              )}
            >
              <input
                type="radio"
                name="subscribe-interval"
                className="size-4 border-warm-300 text-brand-500 focus:ring-brand-400"
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(interval)}
              />
              <span>{SUBSCRIPTION_INTERVAL_LABEL[interval]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
