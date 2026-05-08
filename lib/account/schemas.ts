import { z } from 'zod';
import { shippingAddressSchema } from '@/lib/checkout/schemas';

/**
 * Saved address input schema. Re-uses `shippingAddressSchema` from Phase 6
 * verbatim and tacks on the optional `isDefault` toggle so the create /
 * edit forms can flip the saved-default flag in a single submission.
 *
 * NOT duplicated — exporting `shippingAddressSchema` directly would lose
 * the `isDefault` extension; extending it preserves the underlying field
 * validators.
 */
export const addressInputSchema = shippingAddressSchema.extend({
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export const settingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name must be 80 characters or fewer'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(254, 'Email must be 254 characters or fewer'),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
