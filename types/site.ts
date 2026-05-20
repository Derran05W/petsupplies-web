export type BrandValue = {
  title: string;
  body: string;
  icon?: string;
};

export type SiteSettingsPublic = {
  freeShippingThresholdCents: number;
  flatShippingCents: number;
  brandName: string;
  supportEmail: string;
  tagline: string;
  description: string;
  logoAccentWords: number;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubhead: string;
  heroImageUrl: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  brandValues: BrandValue[];
};

export type NavLink = { label: string; href: string; position: number };

export type FooterColumn = {
  column: { key: string; label: string; position: number };
  links: NavLink[];
};

export type CategoryStripItem = {
  id: string;
  label: string;
  imageUrl: string | null;
  href: string;
  position: number;
  isActive: boolean;
};

export type CategoryStripItemInput = {
  label: string;
  imageUrl?: string | null;
  href: string;
  position: number;
  isActive?: boolean;
};

export const STATIC_PAGE_SLUGS = [
  'about',
  'privacy',
  'terms',
  'shipping',
  'returns',
  'faq',
] as const;

export type StaticPageSlug = (typeof STATIC_PAGE_SLUGS)[number];

export type StaticPagePublic = {
  slug: StaticPageSlug;
  title: string;
  bodyMarkdown: string;
  updatedAt: string;
};

export type StaticPageAdmin = StaticPagePublic & {
  isPublished: boolean;
};

export type EmailTemplateKey =
  | 'order-confirmation'
  | 'shipping-notification'
  | 'delivery-confirmation'
  | 'back-in-stock-alert'
  | 'abandoned-cart-reminder'
  | 'password-reset'
  | 'subscription-upcoming-delivery'
  | 'subscription-payment-issue';

export type EmailTemplateAdminSummary = {
  key: EmailTemplateKey;
  subject: string;
  preheader: string | null;
  updatedAt: string;
};

export type EmailTemplateAdminDetail = EmailTemplateAdminSummary & {
  bodyMarkdown: string;
};

export type EmailTemplateUpsertInput = {
  subject: string;
  preheader?: string | null;
  bodyMarkdown: string;
};
