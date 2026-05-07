/**
 * Single source of truth for all brand strings.
 *
 * To rename the business, change `name` and `tagline` here — nothing else
 * needs to change anywhere in the codebase.
 */
export const brand = {
  name: 'pawsupply',
  tagline: "Food they'll actually love.",
  description: 'Thoughtfully sourced, vet-approved nutrition for every pet.',
  supportEmail: 'hello@pawsupply.com',
  social: {
    instagram: '',
    facebook: '',
  },
} as const;

export type Brand = typeof brand;
