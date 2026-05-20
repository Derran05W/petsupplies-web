'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

interface ShippingFormValues {
  freeShippingThresholdDollars: string;
  flatShippingDollars: string;
}

const inputBase =
  'w-full rounded-lg border border-warm-300 bg-surface-card px-3 py-2.5 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400';
const labelBase =
  'mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600';

function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

function dollarsInputToCents(raw: string): number | null {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export function SiteSettingsShippingForm() {
  const { data, isPending, error: loadError } = useSiteSettingsQuery();
  const mutation = useUpdateSiteSettingsMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ShippingFormValues>({
    defaultValues: {
      freeShippingThresholdDollars: '',
      flatShippingDollars: '',
    },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      freeShippingThresholdDollars: centsToDollarsInput(
        data.freeShippingThresholdCents,
      ),
      flatShippingDollars: centsToDollarsInput(data.flatShippingCents),
    });
  }, [data, reset]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading shipping settings…
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="font-body text-sm text-red-700" role="alert">
        {adminApiErrorMessage(loadError)}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        setSuccess(null);

        const freeShippingThresholdCents = dollarsInputToCents(
          values.freeShippingThresholdDollars,
        );
        const flatShippingCents = dollarsInputToCents(
          values.flatShippingDollars,
        );

        if (freeShippingThresholdCents === null || flatShippingCents === null) {
          setSubmitError('Enter valid dollar amounts (0 or greater).');
          return;
        }

        if (freeShippingThresholdCents <= 0) {
          setSubmitError('Free-shipping threshold must be greater than $0.');
          return;
        }

        try {
          await mutation.mutateAsync({
            freeShippingThresholdCents,
            flatShippingCents,
          });
          setSuccess('Changes appear on the storefront within a few minutes.');
        } catch (err) {
          setSubmitError(adminApiErrorMessage(err));
        }
      })}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="free-shipping-threshold" className={labelBase}>
            Free shipping threshold
          </label>
          <div className="relative">
            <span className="text-warm-500 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm">
              $
            </span>
            <input
              id="free-shipping-threshold"
              type="number"
              min="0"
              step="0.01"
              className={cn(inputBase, 'pl-7')}
              {...register('freeShippingThresholdDollars', { required: true })}
            />
          </div>
          <p className="text-warm-500 mt-1.5 font-body text-xs">
            Orders at or above this subtotal qualify for free shipping on the
            storefront and at checkout.
          </p>
        </div>

        <div>
          <label htmlFor="flat-shipping-rate" className={labelBase}>
            Flat shipping rate
          </label>
          <div className="relative">
            <span className="text-warm-500 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm">
              $
            </span>
            <input
              id="flat-shipping-rate"
              type="number"
              min="0"
              step="0.01"
              className={cn(inputBase, 'pl-7')}
              {...register('flatShippingDollars', { required: true })}
            />
          </div>
          <p className="text-warm-500 mt-1.5 font-body text-xs">
            Charged when the cart is below the free-shipping threshold. Use $0
            for free shipping on every order.
          </p>
        </div>
      </div>

      {submitError ? (
        <p className="font-body text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      {success ? (
        <p className="font-body text-sm text-brand-700" role="status">
          {success}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : null}
          Save shipping
        </button>
      </div>
    </form>
  );
}
