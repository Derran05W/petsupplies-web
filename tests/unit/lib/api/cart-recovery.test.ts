import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartLine } from '@/lib/store/cart';
import { getCartRecoveryByToken } from '@/lib/api/cart-recovery';

describe('lib/api/cart-recovery', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GETs decoded cart payloads for signed recovery tokens', async () => {
    const lines: CartLine[] = [
      {
        productId: 'p1',
        slug: 'grain-free',
        name: 'Snack',
        priceCents: 999,
        imageUrl: 'https://example.com/img.jpg',
        category: 'food',
        petType: 'dog',
        stockCount: 3,
        quantity: 2,
        addedAt: new Date().toISOString(),
      },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ lines, redirectToCheckout: true }, { status: 200 }),
      ),
    );

    const snapshot = await getCartRecoveryByToken('token-ish');

    expect(snapshot.lines).toHaveLength(1);
    expect(snapshot.redirectToCheckout).toBe(true);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/email/cart-recovery?token=token-ish',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });
});
