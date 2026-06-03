'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useOrderByCheckoutSession } from '@/hooks/useOrderByCheckoutSession';
import { useCartActions } from '@/hooks/useCart';
import { clearPendingOrderId } from '@/lib/checkout/pending-order';
import { OrderSummaryCard } from './OrderSummaryCard';

interface SuccessContentsProps {
  /** From `?session_id=`. `null` if the param is missing. */
  sessionId: string | null;
}

/**
 * Drives the success-page polling state machine and the one-shot cart
 * clear. Strictly client-side because:
 *   - the cart store is client-only
 *   - the polling hook uses `useQuery` + `setTimeout`
 *   - the live-region heading transition needs to mutate after mount
 *
 * `idle → polling → confirmed | timeout | error`
 *
 *   confirmed → render `<OrderSummaryCard />` and call `clear()` ONCE
 *   timeout   → friendly "still processing" panel; cart NOT cleared
 *   error     → friendly error panel; cart NOT cleared
 *   idle      → no `?session_id=`; "we can't find that checkout" panel
 */
export function SuccessContents({ sessionId }: SuccessContentsProps) {
  const { phase, order } = useOrderByCheckoutSession(sessionId);
  const { clear } = useCartActions();

  // Fire `clear()` exactly once when the order is confirmed. Strict mode
  // double-mounts the effect in dev — the ref guard makes that idempotent.
  const clearedRef = useRef(false);
  useEffect(() => {
    if (phase === 'confirmed' && !clearedRef.current) {
      clearedRef.current = true;
      clear();
      clearPendingOrderId();
    }
  }, [phase, clear]);

  if (sessionId === null) {
    return (
      <CenteredPanel>
        <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900">
          We can&apos;t find that checkout.
        </h1>
        <p className="font-body text-sm text-warm-600">
          The link is missing the session reference. If you&apos;ve just paid,
          your order should still show up in your account shortly.
        </p>
        <PanelActions>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            Back to cart
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
          >
            View your orders
          </Link>
        </PanelActions>
      </CenteredPanel>
    );
  }

  if (phase === 'confirmed' && order) {
    return (
      <>
        <span className="sr-only" role="status" aria-live="polite">
          Order confirmed.
        </span>
        <OrderSummaryCard order={order} />
      </>
    );
  }

  if (phase === 'timeout') {
    return (
      <CenteredPanel>
        <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900">
          We&apos;re still processing this.
        </h1>
        <p className="font-body text-sm text-warm-600">
          Stripe has accepted your payment but our system hasn&apos;t finished
          confirming yet. Check your inbox for a receipt, or head to your
          account — your order will appear there as soon as it&apos;s ready.
        </p>
        <PanelActions>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            View your orders
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
          >
            Keep shopping
          </Link>
        </PanelActions>
      </CenteredPanel>
    );
  }

  if (phase === 'error') {
    return (
      <CenteredPanel>
        <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900">
          We hit a snag.
        </h1>
        <p className="font-body text-sm text-warm-600">
          We couldn&apos;t look up your order right now. If you were charged,
          your order is safe — try again in a minute, or head to your account.
        </p>
        <PanelActions>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            View your orders
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
          >
            Back to cart
          </Link>
        </PanelActions>
      </CenteredPanel>
    );
  }

  return (
    <CenteredPanel>
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-full bg-warm-100 text-warm-600"
      >
        <Loader2 size={22} className="animate-spin" />
      </span>
      <h1
        aria-live="polite"
        className="font-display text-3xl tracking-[-0.02em] text-warm-900"
      >
        Confirming your order&hellip;
      </h1>
      <p className="font-body text-sm text-warm-600">
        Hang tight — we&apos;re finalising things with our payment provider.
        This usually takes a few seconds.
      </p>
    </CenteredPanel>
  );
}

function CenteredPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-warm-200 bg-surface-card px-6 py-10 text-center shadow-sm md:px-10 md:py-12">
      {children}
    </section>
  );
}

function PanelActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
      {children}
    </div>
  );
}
