import { describe, expect, it } from 'vitest';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';

describe('Hero settings defaults', () => {
  it('falls back to seeded hero copy when settings fields are empty', () => {
    const settings = {
      ...SITE_SETTINGS_FALLBACK,
      heroEyebrow: '',
      heroHeadline: '',
      heroSubhead: '',
      heroImageUrl: '',
    };

    const eyebrow =
      settings.heroEyebrow.trim().length > 0
        ? settings.heroEyebrow
        : SITE_SETTINGS_FALLBACK.heroEyebrow;
    const headline =
      settings.heroHeadline.trim().length > 0
        ? settings.heroHeadline
        : SITE_SETTINGS_FALLBACK.heroHeadline;
    const imageUrl =
      settings.heroImageUrl.trim().length > 0
        ? settings.heroImageUrl
        : SITE_SETTINGS_FALLBACK.heroImageUrl;

    expect(eyebrow).toBe('New season · vet approved');
    expect(headline).toBe("Food they'll actually love.");
    expect(imageUrl).toBe('/images/hero-placeholder.jpg');
  });
});
