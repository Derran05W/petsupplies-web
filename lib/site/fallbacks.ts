import { FREE_SHIPPING_DEFAULT_CENTS } from '@/lib/config/shipping-env';
import { formatPrice } from '@/lib/utils/format';
import type { SiteSettingsPublic } from '@/types/site';

function thresholdCentsFromEnv(): number {
  const raw = process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS;
  if (typeof raw !== 'string' || raw.length === 0) {
    return FREE_SHIPPING_DEFAULT_CENTS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return FREE_SHIPPING_DEFAULT_CENTS;
  }
  return parsed;
}

const thresholdCents = thresholdCentsFromEnv();

/** Build-time defaults when `GET /site/settings` is unreachable. */
export const SITE_SETTINGS_FALLBACK: SiteSettingsPublic = {
  freeShippingThresholdCents: thresholdCents,
  flatShippingCents: 0,
  brandName: "Aileen's petstore",
  supportEmail: 'hello@aileenspetstore.com',
  tagline: "Food they'll actually love.",
  description: 'Thoughtfully sourced, vet-approved nutrition for every pet.',
  logoAccentWords: 1,
  socialInstagram: null,
  socialFacebook: null,
  socialTwitter: null,
  heroEyebrow: 'New season · vet approved',
  heroHeadline: "Food they'll actually love.",
  heroSubhead: 'Thoughtfully sourced, vet-approved nutrition for every pet.',
  heroImageUrl: '/images/hero-placeholder.jpg',
  heroPrimaryCtaLabel: 'Shop now',
  heroPrimaryCtaHref: '/products',
  heroSecondaryCtaLabel: 'Browse categories',
  heroSecondaryCtaHref: '#categories',
  brandValues: [
    {
      title: 'Free shipping',
      body: `On every order over ${formatPrice(thresholdCents)}, anywhere in the country.`,
      icon: 'truck',
    },
    {
      title: 'Vet approved',
      body: 'Recipes formulated alongside practising veterinarians.',
      icon: 'stethoscope',
    },
  ],
};

export { FREE_SHIPPING_DEFAULT_CENTS };
