/** Use real ApiError semantics for instanceof checks inside the panel. */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { BackInStockPanel } from '@/components/product/BackInStockPanel';
import { renderWithQueryClient } from '@/tests/helpers/render';
import {
  oneFeaturedProduct,
  outOfStockProduct,
} from '@/tests/fixtures/products';
import { ApiError } from '@/lib/api/client';

const push = vi.fn();
const refresh = vi.fn();
const mocks = vi.hoisted(() => ({
  isAlerted: false,
  createPending: false,
  mutateAsyncImpl: (_args?: unknown) => Promise.resolve(undefined),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    refresh,
  }),
  usePathname: () => '/products/slug',
}));

vi.mock('@/hooks/useStockAlerts', () => ({
  useIsStockAlertedFor: (_id: string) => mocks.isAlerted,
  useCreateStockAlertMutation: () => ({
    mutateAsync: (...args: unknown[]) =>
      mocks.mutateAsyncImpl(...args) as Promise<void>,
    mutate: vi.fn(),
    isPending: mocks.createPending,
    isIdle: true,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
  }),
  useDeleteStockAlertMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isIdle: true,
    isSuccess: false,
    isError: false,
    reset: vi.fn(),
  }),
}));

const useAuthSpy = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthSpy(),
}));

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  mocks.isAlerted = false;
  mocks.createPending = false;
  mocks.mutateAsyncImpl = () => Promise.resolve(undefined);
  useAuthSpy.mockReturnValue({
    user: null,
    loading: false,
    signOut: vi.fn(),
  });
});

describe('BackInStockPanel', () => {
  it('renders nothing when product is in stock', () => {
    const product = oneFeaturedProduct();
    renderWithQueryClient(<BackInStockPanel product={product} />);

    expect(
      screen.queryByRole('button', { name: /notify me when back/i }),
    ).not.toBeInTheDocument();
  });

  it('signing out path: notify button redirects to login', async () => {
    useAuthSpy.mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    });

    const user = userEvent.setup();
    renderWithQueryClient(<BackInStockPanel product={outOfStockProduct()} />);

    await user.click(
      screen.getByRole('button', { name: /notify me when back/i }),
    );

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining('/login?redirect='),
    );
  });

  it('signed in + not alerted: clicking notify invokes mutateAsync', async () => {
    useAuthSpy.mockReturnValue({
      user: { id: 'u1' },
      loading: false,
      signOut: vi.fn(),
    });
    mocks.mutateAsyncImpl = vi.fn().mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithQueryClient(<BackInStockPanel product={outOfStockProduct()} />);

    await user.click(
      screen.getByRole('button', { name: /notify me when back/i }),
    );

    await vi.waitFor(() => expect(mocks.mutateAsyncImpl).toHaveBeenCalled());
    expect(refresh).toHaveBeenCalled();
  });

  it('shows subscribed state when alerted', async () => {
    useAuthSpy.mockReturnValue({
      user: { id: 'u1' },
      loading: false,
      signOut: vi.fn(),
    });
    mocks.isAlerted = true;

    renderWithQueryClient(<BackInStockPanel product={outOfStockProduct()} />);

    await vi.waitFor(() =>
      expect(
        screen.getByText(/We'll email you when this is back/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/manage alerts/i)).toBeInTheDocument();
  });

  it('surfaces create error messaging', async () => {
    useAuthSpy.mockReturnValue({
      user: { id: 'u1' },
      loading: false,
      signOut: vi.fn(),
    });
    mocks.mutateAsyncImpl = vi
      .fn()
      .mockRejectedValue(new ApiError('bad message', 500));

    const user = userEvent.setup();
    renderWithQueryClient(<BackInStockPanel product={outOfStockProduct()} />);

    await user.click(
      screen.getByRole('button', { name: /notify me when back/i }),
    );

    await vi.waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/bad/i),
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it('shows refresh hint when restock-conflict ApiError fires', async () => {
    useAuthSpy.mockReturnValue({
      user: { id: 'u1' },
      loading: false,
      signOut: vi.fn(),
    });
    mocks.mutateAsyncImpl = vi
      .fn()
      .mockRejectedValue(new ApiError('already in stock', 400));

    const user = userEvent.setup();
    renderWithQueryClient(<BackInStockPanel product={outOfStockProduct()} />);

    await user.click(
      screen.getByRole('button', { name: /notify me when back/i }),
    );

    await vi.waitFor(() =>
      expect(
        screen.getByRole('button', { name: /refresh page/i }),
      ).toBeVisible(),
    );
  });
});
