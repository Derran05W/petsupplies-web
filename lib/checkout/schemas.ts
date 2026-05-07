import { z } from 'zod';

/**
 * Permissive postal-code regex: 3–10 chars, alphanumeric + space + hyphen.
 * Stripe re-validates against the actual country at session creation time,
 * so we deliberately don't try to match every country's format here.
 */
const POSTAL_CODE_RE = /^[A-Za-z0-9 \-]{3,10}$/;

/**
 * ISO-3166-1 alpha-2 country codes the form accepts. Phase 6 ships the
 * launch market plus two near neighbours; expanding to the full Stripe
 * supported-countries list is a Phase 7+ follow-up.
 */
export const SUPPORTED_COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
] as const;

export type SupportedCountryCode = (typeof SUPPORTED_COUNTRIES)[number]['code'];

const SUPPORTED_COUNTRY_CODES = SUPPORTED_COUNTRIES.map((c) => c.code) as [
  SupportedCountryCode,
  ...SupportedCountryCode[],
];

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(120, 'Full name must be 120 characters or fewer'),
  line1: z
    .string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(200, 'Address line 1 must be 200 characters or fewer'),
  line2: z
    .string()
    .trim()
    .max(200, 'Address line 2 must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City must be 100 characters or fewer'),
  state: z
    .string()
    .trim()
    .min(1, 'State / region is required')
    .max(100, 'State / region must be 100 characters or fewer'),
  postalCode: z
    .string()
    .trim()
    .regex(POSTAL_CODE_RE, 'Enter a valid postal code'),
  country: z.enum(SUPPORTED_COUNTRY_CODES, {
    message: 'Select a country',
  }),
});

export const checkoutFormSchema = shippingAddressSchema.extend({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(254, 'Email must be 254 characters or fewer'),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
