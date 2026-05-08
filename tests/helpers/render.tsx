/**
 * Per-test render helpers. Kept narrow:
 *   - `renderWithQueryClient(ui)` for any tree that calls into TanStack
 *     Query (used by `useAddresses` tests). Each invocation gets a
 *     fresh `QueryClient` with `retry: false` so a failing mutation
 *     surfaces immediately instead of retrying through the whole test
 *     budget.
 *
 * `tests/setup.ts` stays thin (jest-dom matchers + cleanup) so the
 * decision to wrap in a QueryClientProvider is opt-in per test rather
 * than implicit on every render.
 */
import type { ReactElement } from 'react';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface RenderWithQueryClientResult extends RenderResult {
  queryClient: QueryClient;
}

export function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderWithQueryClientResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  const result = render(ui, { wrapper: Wrapper, ...options });
  return { ...result, queryClient };
}
