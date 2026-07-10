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
      <legend className="font-body text-micro uppercase text-ink">
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
                'flex cursor-pointer items-center gap-3 rounded-tile border px-3 py-2.5 font-body text-sm transition-colors duration-fast',
                selected
                  ? 'border-pine bg-paper text-ink'
                  : 'border-line bg-paper text-ink-secondary hover:border-ink',
                disabled ? 'cursor-not-allowed opacity-60' : '',
              )}
            >
              <input
                type="radio"
                name="subscribe-interval"
                className="size-4 border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
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
