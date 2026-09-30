import { z } from 'zod';
import { ADMIN_PRODUCT_CATEGORIES } from '@/types/admin-product-api';

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
  url: z.string().url(),
  alt: z.string().trim().min(1, 'Alt text is required for every image'),
  isPrimary: z.boolean(),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be 200 characters or fewer'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(200, 'Slug must be 200 characters or fewer')
    .regex(SLUG_RE, 'Use lowercase letters, numbers, and dashes only'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(10_000, 'Description must be 10,000 characters or fewer'),
  priceCents: z
    .number({ message: 'Enter a valid price' })
    .int('Price must be a whole number of cents')
    .positive('Price must be greater than zero'),
  category: z.enum(ADMIN_PRODUCT_CATEGORIES, {
    message: 'Select a category',
  }),
  categories: z
    .array(z.enum(ADMIN_PRODUCT_CATEGORIES))
    .min(1, 'Select at least one category')
    .max(8, 'Select up to 8 categories'),
  ingredients: z.string().trim().max(5000).optional(),
  stockCount: z
    .number({ message: 'Enter a stock count' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  images: z.array(productImageSchema).min(1, 'Add at least one product image'),
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
