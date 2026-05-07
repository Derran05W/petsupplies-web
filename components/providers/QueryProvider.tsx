'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Wraps the React tree in a single `QueryClient`. Stored in `useState`
 * lazy initialiser so the client survives Fast Refresh / route changes
 * without being recreated (per TanStack Query's SSR/Next.js guidance).
 *
 * Phase 4 only consumes this on the client (the listing page server-fetches
 * its initial data). Phase 5+ will use it for cart-driven cache
 * invalidation. Defaults are tuned for product data — long-ish stale time,
 * no aggressive refetch on focus.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
