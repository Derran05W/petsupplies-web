import { describe, expect, it } from 'vitest';
import {
  accountFirstNameFromUser,
  firstNameFromLabel,
} from '@/lib/reviews/display-name';
import type { User } from '@supabase/supabase-js';

describe('firstNameFromLabel', () => {
  it('returns first token only', () => {
    expect(firstNameFromLabel('Taylor Verified')).toBe('Taylor');
    expect(firstNameFromLabel('sam')).toBe('sam');
  });
});

describe('accountFirstNameFromUser', () => {
  it('extracts first name from metadata', () => {
    const user = {
      id: 'u1',
      email: 'taylor@example.com',
      user_metadata: { full_name: 'Taylor Verified' },
    } as unknown as User;
    expect(accountFirstNameFromUser(user)).toBe('Taylor');
  });
});
