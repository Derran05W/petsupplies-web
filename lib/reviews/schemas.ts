import { z } from 'zod';

const starRating = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const reviewCreateSchema = z.object({
  rating: starRating,
  title: z.string().max(80, 'Title must be 80 characters or fewer'),
  body: z
    .string()
    .min(20, 'Review must be at least 20 characters')
    .max(2000, 'Review must be 2000 characters or fewer'),
});

export type ReviewFormInputValues = z.infer<typeof reviewCreateSchema>;
