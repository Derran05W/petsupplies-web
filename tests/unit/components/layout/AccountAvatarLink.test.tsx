/**
 * AccountAvatarLink — boutique ink-outline avatar pill. Links to /account
 * with the return-to query, exposes an accessible label, and shows the
 * initial until a slow navigation flips it to a spinner.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
}));

import { AccountAvatarLink } from '@/components/layout/AccountAvatarLink';

describe('AccountAvatarLink', () => {
  it('renders the initial inside an accessible account link', () => {
    render(<AccountAvatarLink ariaLabel="Your account" initial="A" />);
    const link = screen.getByRole('link', { name: 'Your account' });
    expect(link).toHaveTextContent('A');
    expect(link.getAttribute('href')).toContain('/account');
    expect(link).toHaveClass('rounded-pill', 'border-ink');
  });

  it('respects an explicit href', () => {
    render(
      <AccountAvatarLink
        ariaLabel="Your account"
        initial="J"
        href="/account/orders"
      />,
    );
    expect(screen.getByRole('link', { name: 'Your account' })).toHaveAttribute(
      'href',
      '/account/orders',
    );
  });
});
