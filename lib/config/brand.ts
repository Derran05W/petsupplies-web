import { fetchSiteSettings } from '@/lib/api/site/settings';

/**
 * Build-time defaults for brand strings. Server components should prefer
 * `getBrand()` which reads `GET /site/settings`.
 *
 * `logoAccentWords` controls how many space-separated words in the name
 * are rendered in the brand accent colour in the navbar (default: 1).
 */
export interface Brand {
  name: string;
  logoAccentWords: number;
  tagline: string;
  description: string;
  supportEmail: string;
  social: {
    instagram: string;
    facebook: string;
  };
}

export const brand = {
  name: "Aileen's petstore",
  logoAccentWords: 1,
  tagline: "Food they'll actually love.",
  description: 'Thoughtfully sourced, vet-approved nutrition for every pet.',
  supportEmail: 'hello@aileenspetstore.com',
  social: {
    instagram: '',
    facebook: '',
  },
} satisfies Brand;

/**
 * Theme palette — the five source colours the design system is built from.
 * Changing these here is step 1; you also need to update tailwind.config.ts
 * and app/globals.css to regenerate the full colour scales.
 */
export const theme = {
  coral: '#F16C43', // primary action (brand-400)
  peach: '#FFA47C', // light accent   (brand-300)
  terracotta: '#A4645A', // dark accent     (brand-600)
  dustyRose: '#A37777', // muted tone      (warm-400)
  deepPlum: '#612F3A', // primary text    (warm-900)
} as const;

export type Theme = typeof theme;

/** Server helper — live brand from site settings with static fallback. */
export async function getBrand(): Promise<Brand> {
  const settings = await fetchSiteSettings();
  return {
    name: settings.brandName,
    logoAccentWords: settings.logoAccentWords,
    tagline: settings.tagline,
    description: settings.description,
    supportEmail: settings.supportEmail,
    social: {
      instagram: settings.socialInstagram ?? '',
      facebook: settings.socialFacebook ?? '',
    },
  };
}
