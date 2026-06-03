import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  createStockAlert,
  deleteStockAlert,
  listStockAlerts,
  normalizeStockAlertRow,
} from '@/lib/api/stockAlerts';
import { sampleStockAlert } from '@/tests/fixtures/stockAlerts';

describe('lib/api/stockAlerts', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('normalizeStockAlertRow', () => {
    it('derives productId from nested product', () => {
      const alert = sampleStockAlert();
      const row = { product: alert.product, createdAt: alert.createdAt };
      expect(normalizeStockAlertRow(row)?.productId).toEqual(alert.product.id);
    });

    it('accepts created_at snake_case', () => {
      const row = {
        product: sampleStockAlert().product,
        created_at: '2026-01-01T00:00:00.000Z',
      };
      const n = normalizeStockAlertRow(row);
      expect(n?.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  it('GET normalises bare array payload', async () => {
    const row = sampleStockAlert();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json([row], { status: 200 })),
    );

    const rows = await listStockAlerts({ accessToken: 'tok' });
    expect(rows).toEqual([row]);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/stock-alerts',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET normalises items[] envelope', async () => {
    const row = sampleStockAlert();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ items: [row], meta: {} }, { status: 200 }),
      ),
    );

    const rows = await listStockAlerts({ accessToken: 'tok' });
    expect(rows).toEqual([row]);
  });

  it('GET throws on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(
      listStockAlerts({ accessToken: 'tok' }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('GET rethrows non-network ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'no' }, { status: 401 })),
    );

    await expect(
      listStockAlerts({ accessToken: 'bad' }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('POST returns payload on 201', async () => {
    const row = sampleStockAlert();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(row, { status: 201 })),
    );

    const result = await createStockAlert(row.productId, {
      accessToken: 'tok',
      product: row.product,
    });
    expect(result.productId).toBe(row.productId);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/stock-alerts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productId: row.productId }),
      }),
    );
  });

  it('POST treats 409 as success when product snapshot is provided', async () => {
    const row = sampleStockAlert();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'exists' }, { status: 409 })),
    );

    const result = await createStockAlert(row.productId, {
      accessToken: 'tok',
      product: row.product,
    });
    expect(result.product).toEqual(row.product);
    expect(result.productId).toBe(row.productId);
    expect(result.createdAt.length).toBeGreaterThan(0);
  });

  it('POST throws on network error', async () => {
    const row = sampleStockAlert();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(
      createStockAlert(row.productId, {
        accessToken: 'tok',
        product: row.product,
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('DELETE swallows 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'gone' }, { status: 404 })),
    );

    await expect(
      deleteStockAlert('pid', { accessToken: 'tok' }),
    ).resolves.toBeUndefined();
  });

  it('DELETE throws on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(
      deleteStockAlert('pid', { accessToken: 'tok' }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('DELETE rethrows other ApiErrors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'nope' }, { status: 500 })),
    );

    await expect(
      deleteStockAlert('pid', { accessToken: 'tok' }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
