import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildRootMetadata, resolveSiteUrl } from '@/lib/site/metadata';
import type { Brand } from '@/lib/config/brand';

const testBrand: Brand = {
  name: 'Test Store',
  logoAccentWords: 1,
  tagline: 'Good things',
  description: 'A lovely little shop.',
  supportEmail: 'hi@example.com',
  social: { instagram: '', facebook: '' },
};

describe('resolveSiteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to localhost when unset', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(resolveSiteUrl()).toBe('http://localhost:3000');
  });

  it('reads NEXT_PUBLIC_SITE_URL and trims trailing slashes', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://shop.example.com//');
    expect(resolveSiteUrl()).toBe('https://shop.example.com');
  });
});

describe('buildRootMetadata', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps the title default + template byte-identical', () => {
    const meta = buildRootMetadata(testBrand);
    expect(meta.title).toEqual({
      default: 'Test Store — Good things',
      template: '%s · Test Store',
    });
    expect(meta.description).toBe('A lovely little shop.');
  });

  it('sets metadataBase from the resolved site url', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://shop.example.com');
    const meta = buildRootMetadata(testBrand);
    expect(meta.metadataBase?.toString()).toBe('https://shop.example.com/');
  });

  it('adds openGraph and twitter defaults without a sitewide canonical', () => {
    const meta = buildRootMetadata(testBrand);
    // Root metadata is inherited by every page, so a canonical (or og:url)
    // here would mark all pages as duplicates of the homepage.
    expect(meta.alternates).toBeUndefined();
    expect(meta.openGraph).not.toHaveProperty('url');
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      siteName: 'Test Store',
      locale: 'en_US',
      title: 'Test Store — Good things',
      description: 'A lovely little shop.',
    });
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Test Store — Good things',
    });
  });
});
