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

const emptyToUndefined = (v: unknown): unknown =>
  v === '' || v === null ? undefined : v;

/** Backend pet species (lowercase enum). */
export const PET_SPECIES = ['dog', 'cat', 'bird', 'small_animal'] as const;

type PetSpeciesValue = (typeof PET_SPECIES)[number];

const PET_SPECIES_VALUES = PET_SPECIES as unknown as readonly [
  PetSpeciesValue,
  ...PetSpeciesValue[],
];

/** Validated POST/PATCH payload for `/users/me/pets[/:id]`. */
export const petInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(60, 'Name must be 60 characters or fewer'),
  species: z.enum(PET_SPECIES_VALUES, {
    message: 'Pick a species',
  }),
  breed: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(80, 'Breed must be 80 characters or fewer')
      .optional(),
  ),
  birthDate: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
      .optional(),
  ),
  weightGrams: z.preprocess(
    emptyToUndefined,
    z.number().int().positive().max(200_000, 'Weight is too large').optional(),
  ),
  dietaryNotes: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(500, 'Notes must be 500 characters or fewer')
      .optional(),
  ),
  profilePhotoUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url('Enter a valid URL').optional(),
  ),
});

export type PetInput = z.infer<typeof petInputSchema>;

/**
 * Form model for Phase 15 pet profile screens. `weightInput` is a decimal
 * string in kg or lb; converted to grams server-side via
 * {@link petProfileFormValuesToPetInput}.
 */
export const petProfileFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(60, 'Name must be 60 characters or fewer'),
    species: z
      .string()
      .trim()
      .refine((s) => (PET_SPECIES as readonly string[]).includes(s), {
        message: 'Pick a species',
      }),
    breed: z.string().trim().max(80, 'Breed must be 80 characters or fewer'),
    birthDate: z.string(),
    dietaryNotes: z
      .string()
      .trim()
      .max(500, 'Notes must be 500 characters or fewer'),
    profilePhotoUrl: z.string(),
    weightInput: z.string(),
    weightUnit: z.enum(['kg', 'lb']),
  })
  .superRefine((data, ctx) => {
    const b = data.birthDate.trim();
    if (b.length > 0 && !/^\d{4}-\d{2}-\d{2}$/.test(b)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Use YYYY-MM-DD',
        path: ['birthDate'],
      });
    }
    const w = data.weightInput.trim();
    if (w !== '') {
      const num = Number.parseFloat(w.replace(',', '.'));
      if (!Number.isFinite(num) || num <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a positive weight',
          path: ['weightInput'],
        });
      } else {
        if (data.weightUnit === 'kg' && num > 200) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Maximum 200 kg for this beta',
            path: ['weightInput'],
          });
        }
        if (data.weightUnit === 'lb' && num > 440) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Maximum 440 lb for this beta',
            path: ['weightInput'],
          });
        }
      }
    }
    const photo = data.profilePhotoUrl.trim();
    if (photo.length > 0) {
      try {
        new URL(photo);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid URL',
          path: ['profilePhotoUrl'],
        });
      }
    }
  });

export type PetProfileFormValues = z.infer<typeof petProfileFormSchema>;

/** Builds an API-ready payload from validated form fields. */
export function petProfileFormValuesToPetInput(
  raw: PetProfileFormValues,
): PetInput {
  const species = raw.species;
  if (
    species !== 'dog' &&
    species !== 'cat' &&
    species !== 'bird' &&
    species !== 'small_animal'
  ) {
    throw new Error('Invalid species');
  }

  let weightGrams: number | undefined;
  const w = raw.weightInput.trim();
  if (w !== '') {
    const num = Number.parseFloat(w.replace(',', '.'));
    weightGrams = Math.round(
      raw.weightUnit === 'kg' ? num * 1000 : num * 453.592,
    );
  }

  const breed = raw.breed.trim().length ? raw.breed.trim() : undefined;
  const birthDate = raw.birthDate.trim().length
    ? raw.birthDate.trim()
    : undefined;
  const dietaryNotes = raw.dietaryNotes.trim().length
    ? raw.dietaryNotes.trim()
    : undefined;
  const profilePhotoUrl = raw.profilePhotoUrl.trim().length
    ? raw.profilePhotoUrl.trim()
    : undefined;

  const candidate: Partial<PetInput> & Pick<PetInput, 'name' | 'species'> = {
    name: raw.name.trim(),
    species,
    breed,
    birthDate,
    weightGrams,
    dietaryNotes,
    profilePhotoUrl,
  };

  return petInputSchema.parse(candidate);
}
