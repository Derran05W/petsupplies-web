/**
 * Minimal product type used by ProductCard and placeholder data.
 * Phase 4 will extend this to mirror the backend Prisma schema
 * (multi-image, search facets, stock, etc.).
 */
export type PetType = 'dog' | 'cat' | 'bird' | 'small-animal';

export interface Product {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  category: string;
  petType: PetType;
}
