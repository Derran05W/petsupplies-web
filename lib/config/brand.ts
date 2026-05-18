/**
 * Single source of truth for all brand strings.
 *
 * To rename the business, change `name` and `tagline` here — nothing else
 * needs to change anywhere in the codebase.
 *
 * `logoAccentWords` controls how many space-separated words in the name
 * are rendered in the brand accent colour in the navbar (default: 1).
 */
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
} as const;

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

export type Brand = typeof brand;
export type Theme = typeof theme;
