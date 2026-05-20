import { z } from 'zod';

const CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;

export const discountCreateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Code must be at least 3 characters')
      .max(32, 'Code must be 32 characters or fewer')
      .regex(CODE_RE, 'Use letters, numbers, underscores, and dashes only'),
    type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
    value: z.coerce.number().int(),
    minCartDollars: z.string().optional(),
    maxRedemptions: z.string().optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    active: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'PERCENTAGE' && (data.value < 1 || data.value > 100)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage must be between 1 and 100',
        path: ['value'],
      });
    }
    if (data.type === 'FIXED' && data.value < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fixed amount must be at least 1 cent',
        path: ['value'],
      });
    }
    if (data.type === 'FREE_SHIPPING' && data.value !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Free shipping discounts must have value 0',
        path: ['value'],
      });
    }
  });

export type DiscountCreateFormValues = z.infer<typeof discountCreateSchema>;

export const discountUpdateSchema = z
  .object({
    value: z.coerce.number().int().optional(),
    minCartDollars: z.string().optional(),
    maxRedemptions: z.string().optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const hasField =
      data.value !== undefined ||
      data.minCartDollars !== undefined ||
      data.maxRedemptions !== undefined ||
      data.validFrom !== undefined ||
      data.validUntil !== undefined ||
      data.active !== undefined;
    if (!hasField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Update at least one field',
        path: ['value'],
      });
    }
  });

export type DiscountUpdateFormValues = z.infer<typeof discountUpdateSchema>;

export function parseOptionalDollarsToCents(
  raw: string | undefined,
): number | null | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed * 100);
}

export function parseOptionalPositiveInt(
  raw: string | undefined,
): number | null | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return undefined;
  return parsed;
}

export function parseOptionalIsoDate(
  raw: string | undefined,
): string | null | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}
