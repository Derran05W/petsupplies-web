import { type PET_SPECIES } from '@/lib/account/schemas';

export type PetId = string;

export type PetSpecies = (typeof PET_SPECIES)[number];

export interface Pet {
  id: PetId;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string;
  weightGrams?: number;
  dietaryNotes?: string;
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
