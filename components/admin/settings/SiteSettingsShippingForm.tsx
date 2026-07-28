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
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const labelBase = 'mb-1.5 block font-body text-micro uppercase text-ink';

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
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading shipping settings…
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
          setSubmitError('Enter valid CAD amounts (0 or greater).');
          return;
        }

        if (freeShippingThresholdCents <= 0) {
          setSubmitError(
            'Free-shipping threshold must be greater than $0 CAD.',
          );
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
            Free shipping threshold (CAD)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-ink-faint">
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
          <p className="mt-1.5 font-body text-xs text-ink-faint">
            Orders at or above this subtotal qualify for free shipping on the
            storefront and at checkout.
          </p>
        </div>

        <div>
          <label htmlFor="flat-shipping-rate" className={labelBase}>
            Flat shipping rate (CAD)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-ink-faint">
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
          <p className="mt-1.5 font-body text-xs text-ink-faint">
            Charged when the cart is below the free-shipping threshold. Use $0
            CAD for free shipping on every order.
          </p>
        </div>
      </div>

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
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
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
