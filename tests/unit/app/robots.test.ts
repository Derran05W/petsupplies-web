import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from '@/app/robots';

describe('app/robots', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows all and disallows private surfaces', () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule?.allow).toBe('/');
    expect(rule?.disallow).toEqual([
      '/admin',
      '/account',
      '/checkout',
      '/email',
      '/api',
    ]);
  });

  it('points at the sitemap on the resolved origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://shop.example.com');
    expect(robots().sitemap).toBe('https://shop.example.com/sitemap.xml');
  });
});
