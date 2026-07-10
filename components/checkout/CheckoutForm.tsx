'use client';

import { useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock } from 'lucide-react';
import {
  shippingAddressSchema,
  SUPPORTED_COUNTRIES,
  type ShippingAddressInput,
} from '@/lib/checkout/schemas';
import {
  useCartHasHydrated,
  useCartLines,
  useCartTotals,
  useFreeShippingProgress,
} from '@/hooks/useCart';
import { createCheckoutSession } from '@/lib/api/checkout';
import { ApiError } from '@/lib/api/client';
import { isShippingRateStaleError } from '@/lib/api/shipping';
import { getBrowserAccessToken } from '@/lib/supabase/browser-access-token';
import type { ShippingSelectionInput } from '@/types/shipping';
import { DiscountCodeForm } from '@/components/cart/DiscountCodeForm';
import { ShippingRateSelector } from '@/components/checkout/ShippingRateSelector';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the payment service. Try again or check back shortly.";
const GENERIC_ERROR_MESSAGE =
  'Something went wrong starting your checkout. Please try again.';
const STALE_SHIPPING_MESSAGE =
  'Your shipping rate expired. Please select a rate again and retry.';

function fieldErrorProps(name: string, error: FieldError | undefined) {
  if (!error) {
    return { 'aria-invalid': false as const };
  }
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${name}-error`,
  };
}

const inputBase =
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const inputError = 'border-danger-solid focus:border-danger-solid';
const labelBase = 'mb-1.5 block font-body text-micro uppercase text-ink';

interface CheckoutFormProps {
  onShippingAmountChange?: (amountCents: number | null) => void;
}

export function CheckoutForm({ onShippingAmountChange }: CheckoutFormProps) {
  const hasHydrated = useCartHasHydrated();
  const lines = useCartLines();
  const totals = useCartTotals();
  const { qualifies } = useFreeShippingProgress();
  const hideShippingSelector =
    qualifies || totals?.discountType === 'FREE_SHIPPING';

  const [submitting, setSubmitting] = useState(false);
  const [shippingSelection, setShippingSelection] =
    useState<ShippingSelectionInput | null>(null);
  const [rateKey, setRateKey] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'CA',
    },
  });

  const watchedAddress = watch();

  const onSubmit = handleSubmit(async () => {
    clearErrors('root');
    if (lines.length === 0) {
      setError('root', {
        message: 'Your cart is empty. Add a product before checking out.',
      });
      return;
    }

    if (
      watchedAddress.country === 'CA' &&
      !hideShippingSelector &&
      !shippingSelection
    ) {
      setError('root', {
        message: 'Select a shipping method before continuing.',
      });
      return;
    }

    setSubmitting(true);

    try {
      const accessToken = await getBrowserAccessToken();
      if (!accessToken) {
        setError('root', { message: 'Sign in to continue to payment.' });
        setSubmitting(false);
        return;
      }

      const body =
        watchedAddress.country === 'CA' &&
        shippingSelection &&
        !hideShippingSelector
          ? { shippingSelection }
          : {};

      const { url } = await createCheckoutSession(body, { accessToken });
      window.location.href = url;
    } catch (err) {
      setSubmitting(false);
      if (isShippingRateStaleError(err)) {
        setRateKey((k) => k + 1);
        setShippingSelection(null);
        onShippingAmountChange?.(null);
        setError('root', { message: STALE_SHIPPING_MESSAGE });
        return;
      }
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setError('root', { message: NETWORK_ERROR_MESSAGE });
          return;
        }
        setError('root', { message: err.message || GENERIC_ERROR_MESSAGE });
        return;
      }
      setError('root', { message: GENERIC_ERROR_MESSAGE });
    }
  });

  const submitDisabled = submitting || !hasHydrated || lines.length === 0;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-8 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      {errors.root && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-tile border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger-solid"
        >
          {errors.root.message}
        </div>
      )}

      <DiscountCodeForm />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-title text-ink">
          Shipping address
        </legend>

        <div>
          <label htmlFor="fullName" className={labelBase}>
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            {...register('fullName')}
            {...fieldErrorProps('fullName', errors.fullName)}
            className={cn(inputBase, errors.fullName && inputError)}
          />
          {errors.fullName && (
            <p
              id="fullName-error"
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="line1" className={labelBase}>
            Address line 1
          </label>
          <input
            id="line1"
            type="text"
            autoComplete="address-line1"
            placeholder="123 Maple Street"
            {...register('line1')}
            {...fieldErrorProps('line1', errors.line1)}
            className={cn(inputBase, errors.line1 && inputError)}
          />
          {errors.line1 && (
            <p
              id="line1-error"
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.line1.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="line2" className={labelBase}>
            Address line 2{' '}
            <span className="font-normal normal-case tracking-normal text-ink-faint">
              (optional)
            </span>
          </label>
          <input
            id="line2"
            type="text"
            autoComplete="address-line2"
            placeholder="Apt, suite, unit"
            {...register('line2')}
            {...fieldErrorProps('line2', errors.line2)}
            className={cn(inputBase, errors.line2 && inputError)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className={labelBase}>
              City
            </label>
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              placeholder="Toronto"
              {...register('city')}
              {...fieldErrorProps('city', errors.city)}
              className={cn(inputBase, errors.city && inputError)}
            />
            {errors.city && (
              <p
                id="city-error"
                role="alert"
                className="mt-1 font-body text-xs text-danger-solid"
              >
                {errors.city.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="state" className={labelBase}>
              Province / region
            </label>
            <input
              id="state"
              type="text"
              autoComplete="address-level1"
              placeholder="ON"
              {...register('state')}
              {...fieldErrorProps('state', errors.state)}
              className={cn(inputBase, errors.state && inputError)}
            />
            {errors.state && (
              <p
                id="state-error"
                role="alert"
                className="mt-1 font-body text-xs text-danger-solid"
              >
                {errors.state.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="postalCode" className={labelBase}>
              Postal code
            </label>
            <input
              id="postalCode"
              type="text"
              autoComplete="postal-code"
              placeholder="M5V 2T6"
              {...register('postalCode')}
              {...fieldErrorProps('postalCode', errors.postalCode)}
              className={cn(inputBase, errors.postalCode && inputError)}
            />
            {errors.postalCode && (
              <p
                id="postalCode-error"
                role="alert"
                className="mt-1 font-body text-xs text-danger-solid"
              >
                {errors.postalCode.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="country" className={labelBase}>
              Country
            </label>
            <select
              id="country"
              autoComplete="country"
              {...register('country')}
              {...fieldErrorProps('country', errors.country)}
              className={cn(inputBase, errors.country && inputError)}
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <ShippingRateSelector
        key={rateKey}
        address={watchedAddress}
        hideWhenFreeShipping={hideShippingSelector}
        onSelectionChange={(selection, amountCents) => {
          setShippingSelection(selection);
          onShippingAmountChange?.(amountCents);
        }}
      />

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={submitDisabled}
          className="inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start"
        >
          {submitting && (
            <Loader2 size={16} aria-hidden className="animate-spin" />
          )}
          Continue to payment
        </Button>
        <p className="inline-flex items-center gap-1.5 font-body text-xs text-ink-muted">
          <Lock size={12} aria-hidden className="text-ink-muted" />
          <span>
            Secure payment via Stripe — email collected on the next step
          </span>
        </p>
      </div>
    </form>
  );
}
