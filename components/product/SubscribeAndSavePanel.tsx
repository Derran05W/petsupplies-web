'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Minus, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePetsQuery } from '@/hooks/usePets';
import { useCreateSubscriptionCheckoutMutation } from '@/hooks/useSubscriptions';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import { SubscribeCadenceSelector } from '@/components/product/SubscribeCadenceSelector';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import { isSubscriptionDiscountConflict } from '@/lib/api/subscriptions';
import { ApiError } from '@/lib/api/client';
import type { Product } from '@/types/product';
import {
  previewSubscribeUnitPriceCents,
  type SubscriptionInterval,
} from '@/types/subscription';

type PurchaseMode = 'one_time' | 'subscribe';

interface SubscribeAndSavePanelProps {
  product: Product;
}

export function SubscribeAndSavePanel({ product }: SubscribeAndSavePanelProps) {
  const subscription = product.subscription;
  const { user, loading: authLoading } = useAuth();
  const checkoutMutation = useCreateSubscriptionCheckoutMutation();
  const { data: pets = [], isFetched: petsFetched } = usePetsQuery(
    !authLoading && Boolean(user),
  );
  const petsForPicker = pets.length > 0;

  const [mode, setMode] = useState<PurchaseMode>('one_time');
  const [qty, setQty] = useState(1);
  const defaultInterval =
    subscription?.intervals?.[0] ?? ('4_weeks' as SubscriptionInterval);
  const [interval, setInterval] =
    useState<SubscriptionInterval>(defaultInterval);

  useEffect(() => {
    if (subscription?.intervals.includes(interval)) return;
    if (subscription?.intervals?.[0]) {
      setInterval(subscription.intervals[0]);
    }
  }, [subscription, interval]);

  const [petId, setPetId] = useState<string>('');
  const [rootError, setRootError] = useState<string | null>(null);

  if (!subscription?.enabled || !subscription.intervals.length) {
    return null;
  }

  const discountPercent = subscription.discountPercent;
  const subscribeUnit = previewSubscribeUnitPriceCents(
    product.priceCents,
    discountPercent,
  );
  const max = Math.max(1, product.stockCount);
  const decDisabled = qty <= 1 || !product.inStock;
  const incDisabled = qty >= max || !product.inStock;

  const handleSubscribe = async () => {
    setRootError(null);
    if (!user?.id) return;
    if (!product.inStock) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${origin}/account/subscriptions?checkout=success`;
    const cancelUrl = `${origin}${product.slug ? `/products/${product.slug}?subscribe=cancelled` : '/products'}`;

    try {
      const payload = await checkoutMutation.mutateAsync({
        productId: product.id,
        quantity: qty,
        interval,
        successUrl,
        cancelUrl,
        ...(petId.trim().length > 0 ? { petId: petId.trim() } : {}),
        clientReferenceId: user.id,
      });
      window.location.href = payload.url;
    } catch (err) {
      if (isSubscriptionDiscountConflict(err)) {
        setRootError(
          'A cart promotion is active. Remove your discount code from the cart to start a Subscribe & Save plan.',
        );
        return;
      }
      if (err instanceof ApiError) {
        setRootError(err.message || 'Request failed');
        return;
      }
      if (err instanceof Error) {
        setRootError(err.message);
      } else {
        setRootError('Could not start subscription checkout. Try again.');
      }
    }
  };

  const showSignInChrome = !authLoading && !user;
  const busy = checkoutMutation.isPending;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1 font-body text-xs font-medium text-brand-700">
          <RefreshCw size={13} aria-hidden className="text-brand-500" />
          Subscribe &amp; Save — save {discountPercent}%
        </span>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Purchase option</legend>
        <div className="flex flex-wrap gap-2">
          <ModeButton
            label="One-time purchase"
            selected={mode === 'one_time'}
            onClick={() => setMode('one_time')}
            disabled={busy}
          />
          <ModeButton
            label="Subscribe & Save"
            selected={mode === 'subscribe'}
            onClick={() => setMode('subscribe')}
            disabled={busy}
          />
        </div>
      </fieldset>

      {mode === 'one_time' ? (
        <QuantitySelector product={product} />
      ) : (
        <>
          <p className="font-display text-xl text-brand-700">
            {formatPrice(subscribeUnit)}
            <span className="ml-2 font-body text-sm font-normal text-warm-600">
              / delivery ({discountPercent}% off)
            </span>
          </p>

          {petsForPicker && petsFetched ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="subscribe-pet"
                className="text-warm-800 font-body text-sm font-medium"
              >
                Pet (optional)
              </label>
              <select
                id="subscribe-pet"
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                disabled={busy}
                className="rounded-lg border border-warm-300 bg-white px-3 py-2 font-body text-sm text-warm-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">None</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <SubscribeCadenceSelector
            allowed={subscription.intervals}
            value={
              subscription.intervals.includes(interval)
                ? interval
                : subscription.intervals[0]!
            }
            onChange={setInterval}
            disabled={busy}
          />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="font-body text-sm text-warm-600">Quantity</span>
              <div className="inline-flex items-center rounded-lg border border-warm-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={decDisabled || busy}
                  aria-label="Decrease quantity"
                  className={cn(
                    'inline-flex size-10 items-center justify-center rounded-l-lg text-warm-900 transition-colors',
                    decDisabled || busy
                      ? 'cursor-not-allowed text-warm-400'
                      : 'hover:bg-warm-100',
                  )}
                >
                  <Minus size={14} aria-hidden />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={max}
                  value={qty}
                  disabled={!product.inStock || busy}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    if (!Number.isFinite(next)) return;
                    setQty(Math.max(1, Math.min(max, next)));
                  }}
                  aria-label="Subscription quantity"
                  className="h-10 w-12 border-x border-warm-300 bg-white text-center font-body text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-400 disabled:bg-warm-100 disabled:text-warm-400"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(max, q + 1))}
                  disabled={incDisabled || busy}
                  aria-label="Increase quantity"
                  className={cn(
                    'inline-flex size-10 items-center justify-center rounded-r-lg text-warm-900 transition-colors',
                    incDisabled || busy
                      ? 'cursor-not-allowed text-warm-400'
                      : 'hover:bg-warm-100',
                  )}
                >
                  <Plus size={14} aria-hidden />
                </button>
              </div>
            </div>

            {!product.inStock ? (
              <p className="font-body text-sm text-warm-600" role="status">
                This item is out of stock — Subscribe & Save is unavailable for
                now.
              </p>
            ) : showSignInChrome ? (
              <p className="font-body text-sm text-warm-600">
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`}
                  className="font-medium text-brand-600 underline-offset-4 hover:text-brand-700 hover:underline"
                >
                  Sign in
                </Link>{' '}
                to set up Subscribe & Save and manage deliveries in your
                account.
              </p>
            ) : authLoading ? (
              <span className="inline-flex items-center gap-2 font-body text-sm text-warm-600">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Checking your session…
              </span>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSubscribe()}
                className={cn(
                  'inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-body text-sm font-medium text-white transition-colors sm:w-auto sm:min-w-[14rem]',
                  busy ? 'bg-brand-500' : 'bg-brand-400 hover:bg-brand-500',
                )}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Redirecting…
                  </>
                ) : (
                  'Subscribe via secure checkout'
                )}
              </button>
            )}
          </div>

          {rootError ? (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-800"
            >
              <p>{rootError}</p>
              {rootError.includes('cart') ? (
                <Link
                  href="/cart"
                  className="mt-2 inline-block font-medium underline-offset-4 hover:underline"
                >
                  Go to cart
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function ModeButton({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-lg border px-4 py-2 font-body text-sm font-medium transition-colors',
        selected
          ? 'text-brand-800 border-brand-400 bg-brand-50'
          : 'text-warm-700 border-warm-200 bg-warm-50 hover:border-warm-300',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      )}
    >
      {label}
    </button>
  );
}
