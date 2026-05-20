import { describe, expect, it } from 'vitest';
import { resolveFeaturedDisplay } from '@/lib/site/featured-display';
import { oneFeaturedProduct } from '@/tests/fixtures/products';

describe('resolveFeaturedDisplay', () => {
  it('returns live products when the API curated set is non-empty', () => {
    const live = [
      oneFeaturedProduct(),
      { ...oneFeaturedProduct(), id: 'live-2' },
    ];
    const placeholder = [{ ...oneFeaturedProduct(), id: 'ph-1' }];

    const result = resolveFeaturedDisplay(live, placeholder, 6);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe(live[0]?.id);
  });

  it('falls back to placeholder products when live set is empty', () => {
    const placeholder = [
      { ...oneFeaturedProduct(), id: 'ph-1' },
      { ...oneFeaturedProduct(), id: 'ph-2' },
    ];

    const result = resolveFeaturedDisplay([], placeholder, 6);
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('ph-1');
  });
});
