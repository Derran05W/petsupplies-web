/**
 * Admin orders status filter — the pill set must be EXACTLY the app-lowercase
 * forms of the backend `OrderStatus` enum (PENDING|PAID|SHIPPED|FULFILLED|
 * CANCELLED) plus "All". `delivered`/`refunded` would 400 the list query.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminOrdersToolbar } from '@/components/admin/orders/AdminOrdersToolbar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('AdminOrdersToolbar', () => {
  it('offers exactly All + the five backend statuses', () => {
    render(<AdminOrdersToolbar />);
    const labels = screen
      .getAllByRole('button')
      .map((b) => b.textContent?.trim());
    expect(labels).toEqual([
      'All',
      'Pending',
      'Paid',
      'Fulfilled',
      'Shipped',
      'Cancelled',
    ]);
  });

  it('does not offer delivered or refunded (backend enum would 400)', () => {
    render(<AdminOrdersToolbar />);
    expect(screen.queryByRole('button', { name: 'Delivered' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Refunded' })).toBeNull();
  });
});
