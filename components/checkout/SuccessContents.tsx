'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useOrderByCheckoutSession } from '@/hooks/useOrderByCheckoutSession';
import { useCartActions } from '@/hooks/useCart';
import { clearPendingCheckout } from '@/lib/checkout/storage';
import { clearPendingOrderId } from '@/lib/checkout/pending-order';
import { Button, TONE_CLASSES } from '@/components/ui';
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
      clearPendingCheckout();
      clearPendingOrderId();
    }
  }, [phase, clear]);

  if (sessionId === null) {
    return (
      <CenteredPanel>
        <h1 className="font-display text-title text-ink">
          We can&apos;t find that checkout.
        </h1>
        <p className="font-body text-sm leading-body text-ink-secondary">
          The link is missing the session reference. If you&apos;ve just paid,
          your order should still show up in your account shortly.
        </p>
        <PanelActions>
          <Button href="/cart" className="flex-1 px-5 py-2.5">
            Back to cart
          </Button>
          <Button
            variant="ghost"
            href="/account/orders"
            className="flex-1 px-5 py-2.5"
          >
            View your orders
          </Button>
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
        <h1 className="font-display text-title text-ink">
          We&apos;re still processing this.
        </h1>
        <p className="font-body text-sm leading-body text-ink-secondary">
          Stripe has accepted your payment but our system hasn&apos;t finished
          confirming yet. Check your inbox for a receipt, or head to your
          account — your order will appear there as soon as it&apos;s ready.
        </p>
        <PanelActions>
          <Button href="/account/orders" className="flex-1 px-5 py-2.5">
            View your orders
          </Button>
          <Button
            variant="ghost"
            href="/products"
            className="flex-1 px-5 py-2.5"
          >
            Keep shopping
          </Button>
        </PanelActions>
      </CenteredPanel>
    );
  }

  if (phase === 'error') {
    return (
      <CenteredPanel>
        <h1 className="font-display text-title text-ink">We hit a snag.</h1>
        <p className="font-body text-sm leading-body text-ink-secondary">
          We couldn&apos;t look up your order right now. If you were charged,
          your order is safe — try again in a minute, or head to your account.
        </p>
        <PanelActions>
          <Button href="/account/orders" className="flex-1 px-5 py-2.5">
            View your orders
          </Button>
          <Button variant="ghost" href="/cart" className="flex-1 px-5 py-2.5">
            Back to cart
          </Button>
        </PanelActions>
      </CenteredPanel>
    );
  }

  return (
    <CenteredPanel>
      <span
        aria-hidden
        className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.amber}`}
      >
        <Loader2
          size={22}
          className="animate-spin motion-reduce:animate-none"
        />
      </span>
      <h1 aria-live="polite" className="font-display text-title text-ink">
        Confirming your order&hellip;
      </h1>
      <p className="font-body text-sm leading-body text-ink-secondary">
        Hang tight — we&apos;re finalising things with our payment provider.
        This usually takes a few seconds.
      </p>
    </CenteredPanel>
  );
}

function CenteredPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-card border border-line bg-paper px-6 py-10 text-center md:px-10 md:py-12">
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
