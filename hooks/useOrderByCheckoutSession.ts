'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getOrderByCheckoutSession } from '@/lib/api/checkout';
import type { OrderSummary } from '@/types/order';

/** How often to poll the backend while the order hasn't appeared yet. */
const POLL_INTERVAL_MS = 1500;
/** Hard ceiling on how long we keep polling before giving up. */
const POLL_TIMEOUT_MS = 30_000;

export type CheckoutPollPhase =
  | 'idle'
  | 'polling'
  | 'confirmed'
  | 'timeout'
  | 'error';

export interface UseOrderByCheckoutSessionResult {
  phase: CheckoutPollPhase;
  order: OrderSummary | null;
  error: Error | null;
  query: UseQueryResult<OrderSummary | null, Error>;
}

/**
 * Polls `GET /orders/by-checkout-session/:sessionId` until the order
 * appears (the Stripe webhook may land slightly after the customer
 * redirect) or the 30s timeout fires.
 *
 * The hook owns three pieces of state:
 *   - the underlying `useQuery` (cache + refetch driver)
 *   - a `timedOut` flag flipped once the wall-clock window elapses
 *   - a derived `phase` that callers render from
 *
 * Polling stops when:
 *   - the query returns a non-null `OrderSummary` → `phase = 'confirmed'`
 *   - the wall-clock timer fires → `phase = 'timeout'`
 *   - the query throws (non-404 / non-network error) → `phase = 'error'`
 *
 * Callers must pass `enabled: false` when the session ID is missing so
 * we don't fire a request with an empty path.
 */
export function useOrderByCheckoutSession(
  sessionId: string | null,
): UseOrderByCheckoutSessionResult {
  const [timedOut, setTimedOut] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  const enabled = Boolean(sessionId) && !timedOut;

  const query = useQuery<OrderSummary | null, Error>({
    queryKey: ['order-by-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      return getOrderByCheckoutSession(sessionId);
    },
    enabled,
    refetchInterval: (q) => {
      if (q.state.data) return false;
      if (timedOut) return false;
      return POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0,
    gcTime: 60_000,
  });

  // Wall-clock 30s timeout. The interval also stops once the data shows
  // up (via the `refetchInterval` returning false above), so the only
  // job of this effect is the upper-bound cap.
  useEffect(() => {
    if (!sessionId) return;
    if (query.data) return;
    if (timedOut) return;

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, POLL_TIMEOUT_MS - elapsed);
    const id = window.setTimeout(() => setTimedOut(true), remaining);
    return () => window.clearTimeout(id);
  }, [sessionId, query.data, timedOut]);

  let phase: CheckoutPollPhase;
  if (!sessionId) {
    phase = 'idle';
  } else if (query.data) {
    phase = 'confirmed';
  } else if (query.error) {
    phase = 'error';
  } else if (timedOut) {
    phase = 'timeout';
  } else {
    phase = 'polling';
  }

  return {
    phase,
    order: query.data ?? null,
    error: query.error ?? null,
    query,
  };
}
