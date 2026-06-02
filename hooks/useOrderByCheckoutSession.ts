'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getOrderByCheckoutSession } from '@/lib/api/checkout';
import { getBrowserAccessToken } from '@/lib/supabase/browser-access-token';
import type { OrderSummary } from '@/types/order';

const POLL_INTERVAL_MS = 1500;
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
      const accessToken = await getBrowserAccessToken();
      return getOrderByCheckoutSession(sessionId, { accessToken });
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
