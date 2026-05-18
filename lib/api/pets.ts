import type { Pet, PetId } from '@/types/pet';
import type { PetInput } from '@/lib/account/schemas';
import { apiFetch } from './client';

export type { PetInput };

export interface PetsApiOptions {
  accessToken?: string;
}

function normalizeListPayload(body: unknown): Pet[] {
  if (Array.isArray(body)) return body as Pet[];
  if (
    body &&
    typeof body === 'object' &&
    'pets' in body &&
    Array.isArray((body as { pets: unknown }).pets)
  ) {
    return (body as { pets: Pet[] }).pets;
  }
  return [];
}

export async function listPets(options: PetsApiOptions = {}): Promise<Pet[]> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>(
    '/users/me/pets',
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return normalizeListPayload(raw);
}

export async function getPet(
  id: PetId,
  options: PetsApiOptions = {},
): Promise<Pet> {
  const { accessToken } = options;
  return apiFetch<Pet>(
    `/users/me/pets/${encodeURIComponent(id)}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
}

export async function createPet(
  input: PetInput,
  options: PetsApiOptions = {},
): Promise<Pet> {
  const { accessToken } = options;
  return apiFetch<Pet>(
    '/users/me/pets',
    accessToken
      ? {
          method: 'POST',
          body: JSON.stringify(input),
          accessToken,
        }
      : {
          method: 'POST',
          body: JSON.stringify(input),
        },
  );
}

export async function updatePet(
  id: PetId,
  input: PetInput,
  options: PetsApiOptions = {},
): Promise<Pet> {
  const { accessToken } = options;
  return apiFetch<Pet>(
    `/users/me/pets/${encodeURIComponent(id)}`,
    accessToken
      ? {
          method: 'PATCH',
          body: JSON.stringify(input),
          accessToken,
        }
      : {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
  );
}

export async function deletePet(
  id: PetId,
  options: PetsApiOptions = {},
): Promise<void> {
  const { accessToken } = options;
  await apiFetch<void>(
    `/users/me/pets/${encodeURIComponent(id)}`,
    accessToken ? { method: 'DELETE', accessToken } : { method: 'DELETE' },
  );
}

/** Heuristic for max-pets / capacity validation errors from the API. */
export function isPetCapacityApiError(
  message: string,
  status: number,
): boolean {
  if (status !== 422) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes('max') ||
    lower.includes('limit') ||
    lower.includes('capacity') ||
    lower.includes('too many')
  );
}
