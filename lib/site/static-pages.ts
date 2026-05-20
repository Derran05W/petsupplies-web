import type { StaticPageSlug } from '@/types/site';

export const STATIC_PAGE_LABELS: Record<StaticPageSlug, string> = {
  about: 'About us',
  privacy: 'Privacy policy',
  terms: 'Terms of service',
  shipping: 'Shipping information',
  returns: 'Returns policy',
  faq: 'FAQ',
};

export function isStaticPageSlug(slug: string): slug is StaticPageSlug {
  return slug in STATIC_PAGE_LABELS;
}

export function staticPageLabel(slug: StaticPageSlug): string {
  return STATIC_PAGE_LABELS[slug];
}
