'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from '@/hooks/useSiteSettings';
import type { RewardTier } from '@/types/site';
import { cn } from '@/lib/utils';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from './admin-settings-form-styles';

const MAX_TIERS = 10;

interface EditableTier {
  clientKey: string;
  thresholdDollars: string;
  label: string;
}

function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsInputToCents(raw: string): number | null {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function emptyTier(): EditableTier {
  return {
    clientKey: crypto.randomUUID(),
    thresholdDollars: '',
    label: '',
  };
}

export function SiteSettingsRewardsForm() {
  const { data, isPending, error: loadError } = useSiteSettingsQuery();
  const mutation = useUpdateSiteSettingsMutation();
  const [items, setItems] = useState<EditableTier[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!data || initialized) return;
    setItems(
      data.rewardTiers.map((tier) => ({
        clientKey: crypto.randomUUID(),
        thresholdDollars: centsToDollarsInput(tier.thresholdCents),
        label: tier.label,
      })),
    );
    setInitialized(true);
  }, [data, initialized]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading reward tiers…
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="font-body text-sm text-danger-solid" role="alert">
        {adminApiErrorMessage(loadError)}
      </p>
    );
  }

  function updateItem(index: number, patch: Partial<EditableTier>) {
    setSuccess(null);
    setDirty(true);
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setSuccess(null);
    setDirty(true);
    setItems((current) => [...current, emptyTier()]);
  }

  function removeItem(index: number) {
    setSuccess(null);
    setDirty(true);
    setItems((current) => current.filter((_, i) => i !== index));
  }

  async function save() {
    setSubmitError(null);
    setSuccess(null);

    const tiers: RewardTier[] = [];
    const seen = new Set<number>();

    for (const item of items) {
      if (item.label.trim().length === 0) {
        setSubmitError('Every reward tier needs a label.');
        return;
      }
      const thresholdCents = dollarsInputToCents(item.thresholdDollars);
      if (thresholdCents === null) {
        setSubmitError('Enter a valid threshold (0 or greater) for each tier.');
        return;
      }
      if (seen.has(thresholdCents)) {
        setSubmitError('Each tier needs a unique spend threshold.');
        return;
      }
      seen.add(thresholdCents);
      tiers.push({ thresholdCents, label: item.label.trim() });
    }

    tiers.sort((a, b) => a.thresholdCents - b.thresholdCents);

    try {
      const updated = await mutation.mutateAsync({ rewardTiers: tiers });
      setItems(
        updated.rewardTiers.map((tier) => ({
          clientKey: crypto.randomUUID(),
          thresholdDollars: centsToDollarsInput(tier.thresholdCents),
          label: tier.label,
        })),
      );
      setDirty(false);
      setSuccess(settingsSuccessMessage);
    } catch (err) {
      setSubmitError(adminApiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-body text-sm leading-body text-ink-secondary">
          Gift milestones shown as a progress bar on product pages and in the
          cart. Shoppers see how much more to spend to unlock each reward. Save
          an empty list to hide the feature everywhere.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= MAX_TIERS}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-ink bg-transparent px-4 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} aria-hidden />
          Add tier
        </button>
      </div>

      <ul className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li
            key={item.clientKey}
            className="border-b border-line pb-4 last:border-0 last:pb-0"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-body text-micro uppercase text-ink">
                Tier {index + 1}
              </p>
              <button
                type="button"
                aria-label={`Remove tier ${index + 1}`}
                onClick={() => removeItem(index)}
                className="font-body text-micro uppercase text-danger-solid transition-opacity duration-fast hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-solid"
              >
                Remove
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`reward-threshold-${index}`}
                  className={settingsLabelBase}
                >
                  Spend threshold (CAD)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-ink-faint">
                    $
                  </span>
                  <input
                    id={`reward-threshold-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.thresholdDollars}
                    onChange={(event) =>
                      updateItem(index, {
                        thresholdDollars: event.target.value,
                      })
                    }
                    className={cn(settingsInputBase, 'pl-7')}
                  />
                </div>
                <p className="mt-1.5 font-body text-xs text-ink-faint">
                  Use $0 for a reward on any purchase.
                </p>
              </div>
              <div>
                <label
                  htmlFor={`reward-label-${index}`}
                  className={settingsLabelBase}
                >
                  Reward label
                </label>
                <input
                  id={`reward-label-${index}`}
                  value={item.label}
                  maxLength={120}
                  onChange={(event) =>
                    updateItem(index, { label: event.target.value })
                  }
                  placeholder="Free dish sponge"
                  className={settingsInputBase}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">
          No reward tiers yet. Add tiers or save an empty list to hide the gift
          progress bar.
        </p>
      ) : null}

      {submitError ? (
        <p className="font-body text-sm text-danger-solid" role="alert">
          {submitError}
        </p>
      ) : null}

      {success ? (
        <p className="font-body text-sm text-pine" role="status">
          {success}
        </p>
      ) : null}

      <div>
        <button
          type="button"
          disabled={!dirty || mutation.isPending}
          onClick={save}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : null}
          Save rewards
        </button>
      </div>
    </div>
  );
}
