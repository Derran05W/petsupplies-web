/**
 * Confirm dialog wraps destructive cancel — matches wishlist/remove patterns.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StockAlertCard } from '@/components/account/notifications/StockAlertCard';
import { sampleStockAlert } from '@/tests/fixtures/stockAlerts';

vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
  }: {
    alt?: string;
    src?: unknown;
    other?: unknown;
    fill?: unknown;
    sizes?: unknown;
    className?: unknown;
    children?: React.ReactNode;
  }) =>
    typeof src === 'string' ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt ?? ''} src={src} data-testid="stub-image" />
    ) : null,
}));

const mutate = vi.fn();

vi.mock('@/hooks/useStockAlerts', () => ({
  useDeleteStockAlertMutation: () => ({
    mutate,
    isPending: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
  }),
}));

function renderCard(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const result = render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
  return { ...result };
}

beforeEach(() => {
  mutate.mockReset();
  mutate.mockImplementation(
    (_id: string, opts?: { onSuccess?: () => void }) => {
      opts?.onSuccess?.();
    },
  );
});

describe('StockAlertCard', () => {
  it('opening confirm then confirming calls mutate with product id', async () => {
    const user = userEvent.setup();
    const alert = sampleStockAlert();
    renderCard(<StockAlertCard alert={alert} />);

    await user.click(screen.getByRole('button', { name: /cancel alert/i }));

    const dialog = screen.getByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: /^cancel alert$/i }),
    );

    expect(mutate).toHaveBeenCalledWith(alert.product.id, expect.any(Object));
    expect(dialog).not.toBeInTheDocument();
  });

  it('cancel on dialog closes without mutate', async () => {
    const user = userEvent.setup();
    const alert = sampleStockAlert();
    renderCard(<StockAlertCard alert={alert} />);

    await user.click(screen.getByRole('button', { name: /cancel alert/i }));
    await user.keyboard('{Escape}');

    expect(mutate).not.toHaveBeenCalled();
  });
});
