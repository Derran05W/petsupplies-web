import { describe, expect, it } from 'vitest';

/** Smoke import — avoids mounting full Supabase listener graph in jsdom (hang risk). */
describe('AuthProvider module', () => {
  it('exports provider and hook', async () => {
    const mod = await import('@/components/providers/AuthProvider');
    expect(mod.AuthProvider).toBeTypeOf('function');
    expect(mod.useAuth).toBeTypeOf('function');
  });
});
