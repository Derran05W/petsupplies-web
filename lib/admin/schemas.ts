import { z } from 'zod';

const CATEGORY_VALUES = [
  'food',
  'treats',
  'accessories',
  'healthcare',
] as const;
const PET_TYPE_VALUES = ['dog', 'cat', 'bird', 'small-animal'] as const;
const ORDER_STATUS_VALUES = [
  'pending',
  'paid',
  'fulfilled',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TRACKING_NUMBER_RE = /^[A-Za-z0-9 \-]{1,64}$/;

/**
 * Convert a free-form product name into a URL-safe slug. Used by the
 * create flow's "auto-fill slug from name on blur" behaviour. Kept here
 * (not in `lib/utils`) because it's admin-form-specific — customer code
 * never invents slugs.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

const productImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  alt: z.string().trim().min(1, 'Alt text is required for every image'),
  isPrimary: z.boolean(),
});

const guaranteedAnalysisRowSchema = z.object({
  nutrient: z.string().trim().min(1),
  percentage: z.string().trim().min(1),
});

const nutritionalInfoSchema = z.object({
  ingredients: z.string().trim().min(1),
  guaranteedAnalysis: z.array(guaranteedAnalysisRowSchema),
  feedingGuidelines: z.string().trim().min(1),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be 120 characters or fewer'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(120, 'Slug must be 120 characters or fewer')
    .regex(SLUG_RE, 'Use lowercase letters, numbers, and dashes only'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(4000, 'Description must be 4000 characters or fewer'),
  priceCents: z
    .number({ message: 'Enter a valid price' })
    .int('Price must be a whole number of cents')
    .min(1, 'Price must be greater than zero'),
  compareAtPriceCents: z.number().int().min(0).optional(),
  category: z.enum(CATEGORY_VALUES, { message: 'Select a category' }),
  petType: z.enum(PET_TYPE_VALUES, { message: 'Select a pet type' }),
  stockCount: z
    .number({ message: 'Enter a stock count' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  tags: z.array(z.string().trim().min(1)).default([]),
  images: z.array(productImageSchema).min(1, 'Add at least one product image'),
  nutritionalInfo: nutritionalInfoSchema.optional(),
  isPublished: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const orderUpdateSchema = z
  .object({
    status: z.enum(ORDER_STATUS_VALUES).optional(),
    trackingNumber: z
      .string()
      .trim()
      .regex(
        TRACKING_NUMBER_RE,
        'Use letters, numbers, dashes, and spaces (max 64 chars)',
      )
      .optional()
      .or(z.literal('')),
    trackingUrl: z
      .string()
      .trim()
      .url('Enter a valid URL')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.trackingNumber !== undefined ||
      value.trackingUrl !== undefined,
    { message: 'Update at least one field' },
  );

export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;

export const aiPromptSchema = z.object({
  refinement: z
    .string()
    .trim()
    .max(500, 'Refinement prompt must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
});

export type AiPromptInput = z.infer<typeof aiPromptSchema>;
