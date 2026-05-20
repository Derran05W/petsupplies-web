import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getBrand } from '@/lib/config/brand';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';

vi.mock('@/lib/api/site/settings', () => ({
  fetchSiteSettings: vi.fn(),
}));

describe('getBrand', () => {
  beforeEach(async () => {
    const { fetchSiteSettings } = await import('@/lib/api/site/settings');
    vi.mocked(fetchSiteSettings).mockResolvedValue({
      ...SITE_SETTINGS_FALLBACK,
      brandName: 'Curated Pet Co',
      tagline: 'Fresh bowls daily.',
      description: 'Better nutrition for every pet.',
      logoAccentWords: 2,
      supportEmail: 'help@curated.test',
      socialInstagram: 'https://instagram.com/curated',
      socialFacebook: null,
      socialTwitter: 'https://x.com/curated',
    });
  });

  it('maps live site settings into the storefront Brand shape', async () => {
    const live = await getBrand();
    expect(live.name).toBe('Curated Pet Co');
    expect(live.tagline).toBe('Fresh bowls daily.');
    expect(live.logoAccentWords).toBe(2);
    expect(live.supportEmail).toBe('help@curated.test');
    expect(live.social.instagram).toBe('https://instagram.com/curated');
    expect(live.social.facebook).toBe('');
  });
});

describe('buildRootMetadata', () => {
  it('uses live brand name and tagline', async () => {
    const { buildRootMetadata } = await import('@/lib/site/metadata');
    const metadata = buildRootMetadata(await getBrand());
    expect(metadata.title).toEqual({
      default: 'Curated Pet Co — Fresh bowls daily.',
      template: '%s · Curated Pet Co',
    });
    expect(metadata.description).toBe('Better nutrition for every pet.');
  });
});
