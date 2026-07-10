/**
 * Shop route error boundary — boutique-styled alert that surfaces the error
 * message, retries via reset(), and offers a link back to the catalogue.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import ShopError from '@/app/(shop)/error';

describe('ShopError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the error message and calls reset when retried', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ShopError error={new Error('Boom')} reset={reset} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Boom');

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole('link', { name: 'Browse products' }),
    ).toHaveAttribute('href', '/products');
  });
});
