import { describe, expect, it } from 'vitest';
import { resolveFooterColumns } from '@/lib/site/nav-display';
import { FOOTER_NAV_FALLBACK } from '@/lib/site/nav-fallbacks';
import type { FooterColumn } from '@/types/site';

describe('resolveFooterColumns', () => {
  it('returns live footer columns when present', () => {
    const live: FooterColumn[] = [
      {
        column: { key: 'shop', label: 'Shop', position: 0 },
        links: [{ label: 'Dogs', href: '/dogs', position: 0 }],
      },
    ];

    const result = resolveFooterColumns(live);
    expect(result).toHaveLength(1);
    expect(result[0]?.column.label).toBe('Shop');
    expect(result[0]?.links[0]?.href).toBe('/dogs');
  });

  it('falls back to build-time footer columns when API returns none', () => {
    expect(resolveFooterColumns([])).toEqual(FOOTER_NAV_FALLBACK);
  });
});
