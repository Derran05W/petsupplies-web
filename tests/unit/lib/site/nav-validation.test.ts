import { describe, expect, it } from 'vitest';
import { isValidSiteHref, siteHrefError } from '@/lib/site/nav-validation';

describe('isValidSiteHref', () => {
  it('accepts relative paths, https URLs, mailto, and anchors', () => {
    expect(isValidSiteHref('/products')).toBe(true);
    expect(isValidSiteHref('https://example.com')).toBe(true);
    expect(isValidSiteHref('mailto:hello@test.com')).toBe(true);
    expect(isValidSiteHref('#categories')).toBe(true);
  });

  it('rejects empty and malformed values', () => {
    expect(isValidSiteHref('')).toBe(false);
    expect(isValidSiteHref('products')).toBe(false);
    expect(isValidSiteHref('ftp://files.test')).toBe(false);
  });
});

describe('siteHrefError', () => {
  it('returns null for valid hrefs', () => {
    expect(siteHrefError('/about')).toBeNull();
  });

  it('returns a message for invalid hrefs', () => {
    expect(siteHrefError('bad')).toMatch(/relative path/i);
  });
});
