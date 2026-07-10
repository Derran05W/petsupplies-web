import { describe, expect, it } from 'vitest';
import { isSupportedNavLink } from '@/lib/site/nav-utils';

describe('isSupportedNavLink', () => {
  it('keeps links for supported pet types and shelf categories', () => {
    expect(isSupportedNavLink('/')).toBe(true);
    expect(isSupportedNavLink('/products')).toBe(true);
    expect(isSupportedNavLink('/products?petType=dog')).toBe(true);
    expect(isSupportedNavLink('/products?petType=cat&sort=newest')).toBe(true);
    expect(isSupportedNavLink('/products?petType=small-animal')).toBe(true);
    expect(isSupportedNavLink('/products?category=treats')).toBe(true);
    // "fish" only as part of a longer value or search text is fine
    expect(isSupportedNavLink('/products?search=fish+food')).toBe(true);
  });

  it('drops links for unsupported fish/bird pet types', () => {
    expect(isSupportedNavLink('/products?petType=bird')).toBe(false);
    expect(isSupportedNavLink('/products?petType=fish')).toBe(false);
    expect(isSupportedNavLink('/products?category=FISH')).toBe(false);
    expect(isSupportedNavLink('/products?category=birds')).toBe(false);
    expect(isSupportedNavLink('/products?sort=newest&petType=bird')).toBe(
      false,
    );
  });
});
