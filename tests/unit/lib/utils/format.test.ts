/**
 * Direct tests for `lib/utils/format.ts`.
 *
 * `formatPrice` is exercised transitively by ProductCard / CartItem,
 * but `formatDate` and `formatStockBadge` are not — both are used
 * exclusively by RSC pages (account / admin), which jsdom can't
 * render. These tests pull them into the coverage net so the include
 * list stays honest.
 */
import { describe, expect, it } from 'vitest';
import { formatDate, formatPrice, formatStockBadge } from '@/lib/utils/format';

describe('formatPrice', () => {
  it('defaults to CAD and renders the narrow `$` symbol, not `CA$`', () => {
    expect(formatPrice(1299)).toBe('$12.99');
    expect(formatPrice(1299)).not.toContain('CA$');
  });

  it('renders an explicit `cad` identically to the default', () => {
    expect(formatPrice(1299, 'cad')).toBe('$12.99');
    expect(formatPrice(1299, 'cad')).toBe(formatPrice(1299));
  });

  it('respects the currency override', () => {
    const out = formatPrice(1299, 'gbp');
    expect(out).toContain('12.99');
    expect(out.toLowerCase()).toContain('£');
  });

  it('falls back to zero for invalid cent values', () => {
    expect(formatPrice(Number.NaN)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats a valid ISO timestamp into a medium-style en-US date', () => {
    expect(formatDate('2026-03-14T00:00:00.000Z')).toMatch(/Mar (13|14), 2026/);
  });

  it('returns the empty string for unparseable input', () => {
    expect(formatDate('definitely-not-a-date')).toBe('');
  });

  it('honours an explicit options override', () => {
    expect(formatDate('2026-03-14T00:00:00.000Z', { year: 'numeric' })).toBe(
      '2026',
    );
  });
});

describe('formatStockBadge', () => {
  it('returns "out" when the stock count is zero or negative', () => {
    expect(formatStockBadge(0)).toBe('out');
    expect(formatStockBadge(-3)).toBe('out');
  });

  it('returns "low" when the stock count is at or under the threshold', () => {
    expect(formatStockBadge(5)).toBe('low');
    expect(formatStockBadge(10)).toBe('low');
  });

  it('returns "in_stock" when the stock count is above the threshold', () => {
    expect(formatStockBadge(11)).toBe('in_stock');
  });

  it('respects an explicit threshold', () => {
    expect(formatStockBadge(20, 25)).toBe('low');
    expect(formatStockBadge(30, 25)).toBe('in_stock');
  });
});
