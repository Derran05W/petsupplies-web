import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { userHasAdminRole } from '@/lib/account/admin-role';

function mockUser(partial: Partial<User>): User {
  return {
    id: 'u1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'a@b.com',
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: '',
    updated_at: '',
    is_anonymous: false,
    ...partial,
  } as User;
}

describe('userHasAdminRole', () => {
  it('returns false for null', () => {
    expect(userHasAdminRole(null)).toBe(false);
  });

  it('grants admin on app_metadata.role ADMIN', () => {
    expect(
      userHasAdminRole(
        mockUser({
          app_metadata: { role: 'ADMIN' },
          user_metadata: { role: 'USER' },
        }),
      ),
    ).toBe(true);
  });

  it('does NOT trust user_metadata.role (client-mutable)', () => {
    expect(
      userHasAdminRole(
        mockUser({
          app_metadata: {},
          user_metadata: { role: 'ADMIN' },
        }),
      ),
    ).toBe(false);
  });

  it('rejects non-admin', () => {
    expect(
      userHasAdminRole(
        mockUser({
          app_metadata: { role: 'USER' },
          user_metadata: {},
        }),
      ),
    ).toBe(false);
  });
});
