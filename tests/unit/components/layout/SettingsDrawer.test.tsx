import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';
import { SettingsDrawer } from '@/components/layout/SettingsDrawer';

const signOut = vi.fn();
const refreshUser = vi.fn().mockResolvedValue(null);

function mockUser(overrides: Partial<User['user_metadata']> = {}): User {
  return {
    id: 'u1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'pat@example.com',
    email_confirmed_at: undefined,
    phone: undefined,
    confirmation_sent_at: undefined,
    confirmed_at: undefined,
    last_sign_in_at: undefined,
    app_metadata: {},
    user_metadata: { name: 'Pat Customer', ...overrides },
    identities: [],
    created_at: '',
    updated_at: '',
    is_anonymous: false,
  } as User;
}

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api/orders', () => ({
  getOrders: vi.fn().mockResolvedValue({
    orders: [],
    total: 0,
    page: 1,
    pageSize: 3,
    totalPages: 1,
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  })),
}));

import { useAuth } from '@/hooks/useAuth';

const mockUseAuth = vi.mocked(useAuth);

describe('SettingsDrawer', () => {
  beforeEach(() => {
    signOut.mockReset();
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({
      user: mockUser(),
      loading: false,
      signOut,
      refreshUser,
    });
  });

  it('does not show admin banner for non-admin users', async () => {
    render(<SettingsDrawer open onClose={vi.fn()} />);

    expect(
      screen.queryByRole('link', { name: /open admin console/i }),
    ).not.toBeInTheDocument();
  });

  it('shows admin banner when app_metadata.role is ADMIN', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        ...mockUser(),
        app_metadata: { role: 'ADMIN' },
        user_metadata: { name: 'Pat Customer' },
      },
      loading: false,
      signOut,
      refreshUser,
    });

    render(<SettingsDrawer open onClose={vi.fn()} />);

    expect(
      screen.getByRole('link', { name: /open admin console/i }),
    ).toHaveAttribute('href', '/admin');
  });

  it('does NOT show admin banner when only user_metadata.role is ADMIN (spoof guard)', async () => {
    // Admin is granted solely by the trusted app_metadata.role claim; a
    // client-editable user_metadata.role must never unlock the console.
    mockUseAuth.mockReturnValue({
      user: mockUser({ role: 'ADMIN' }),
      loading: false,
      signOut,
      refreshUser,
    });

    render(<SettingsDrawer open onClose={vi.fn()} />);

    expect(
      screen.queryByRole('link', { name: /open admin console/i }),
    ).not.toBeInTheDocument();
  });

  it('shows sign-in hint when signed out', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut,
      refreshUser,
    });

    render(<SettingsDrawer open onClose={vi.fn()} />);

    expect(
      screen.getByText(/sign in to manage your account/i),
    ).toBeInTheDocument();
  });

  it('links profile row to account with accessible name', () => {
    render(<SettingsDrawer open onClose={vi.fn()} />);

    expect(
      screen.getByRole('link', { name: /go to account for pat customer/i }),
    ).toHaveAttribute('href', '/account');
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SettingsDrawer open onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });
});
