import type { FooterColumn, NavLink } from '@/types/site';

/** Build-time header nav when `GET /site/nav` is unreachable. */
export const HEADER_NAV_FALLBACK: NavLink[] = [
  { href: '/', label: 'Home', position: 0 },
  { href: '/products?petType=dog', label: 'Dogs', position: 1 },
  { href: '/products?petType=cat', label: 'Cats', position: 2 },
  { href: '/products?petType=bird', label: 'Birds', position: 3 },
  {
    href: '/products?petType=small-animal',
    label: 'Small animals',
    position: 4,
  },
];

/** Build-time footer nav when `GET /site/nav` is unreachable. */
export const FOOTER_NAV_FALLBACK: FooterColumn[] = [
  {
    column: { key: 'shop', label: 'Shop', position: 0 },
    links: [
      { label: 'All products', href: '/products', position: 0 },
      { label: 'Dogs', href: '/products?petType=dog', position: 1 },
      { label: 'Cats', href: '/products?petType=cat', position: 2 },
      { label: 'Birds', href: '/products?petType=bird', position: 3 },
    ],
  },
  {
    column: { key: 'help', label: 'Help', position: 1 },
    links: [
      { label: 'Shipping', href: '/shipping', position: 0 },
      { label: 'Returns', href: '/returns', position: 1 },
      { label: 'FAQ', href: '/faq', position: 2 },
    ],
  },
  {
    column: { key: 'company', label: 'Company', position: 2 },
    links: [
      { label: 'About', href: '/about', position: 0 },
      { label: 'Privacy', href: '/privacy', position: 1 },
      { label: 'Terms', href: '/terms', position: 2 },
    ],
  },
];

export type SiteNavPublic = {
  header: NavLink[];
  footer: FooterColumn[];
};

export const SITE_NAV_FALLBACK: SiteNavPublic = {
  header: HEADER_NAV_FALLBACK,
  footer: FOOTER_NAV_FALLBACK,
};
