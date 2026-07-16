import type { Pet, PetId, PetSpecies } from '@/types/pet';
import type { PetInput } from '@/lib/account/schemas';
import { apiFetch } from './client';

export type { PetInput };

export interface PetsApiOptions {
  accessToken?: string;
}

/* -------------------------------------------------------------------------- */
/* Wire types + mappers. Backend `PetPublic` is Prisma-shaped: uppercase       */
/* `species` enum, `null` (not `undefined`) for absent optionals, birthDate as */
/* a full ISO timestamp, and a `{ data: [...] }` list envelope.                */
/* -------------------------------------------------------------------------- */

interface ApiPet {
  id: string;
  userId?: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  weightGrams: number | null;
  dietaryNotes: string | null;
  profilePhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Backend species enum (uppercase) ↔ app species (lowercase) is pure case. */
function speciesToApp(species: string): PetSpecies {
  return species.toLowerCase() as PetSpecies;
}

function speciesToWire(species: PetSpecies): string {
  return species.toUpperCase();
}

function mapPet(raw: unknown): Pet {
  const p = raw as ApiPet;
  return {
    id: p.id,
    name: p.name,
    species: speciesToApp(p.species),
    ...(p.breed != null ? { breed: p.breed } : {}),
    // Backend normalises birthDate to a UTC-midnight timestamp; the app + form
    // work with date-only `YYYY-MM-DD`.
    ...(p.birthDate != null
      ? { birthDate: String(p.birthDate).slice(0, 10) }
      : {}),
    ...(p.weightGrams != null ? { weightGrams: p.weightGrams } : {}),
    ...(p.dietaryNotes != null ? { dietaryNotes: p.dietaryNotes } : {}),
    ...(p.profilePhotoUrl != null
      ? { profilePhotoUrl: p.profilePhotoUrl }
      : {}),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * PetInput (lowercase species) → strict backend create/patch body.
 *
 * The pet edit form always submits the COMPLETE profile, so on the UPDATE
 * (PATCH) path an absent optional means the user cleared that field: we send an
 * explicit `null` so the backend clears it (its optionals are `.nullable()`,
 * and `birthDateSchema` / `weightGrams` accept `null` too). Empty strings are
 * rejected by the backend's `min(1)`, but the schema layer already maps blank
 * inputs to `undefined`, so a raw `''` never reaches here. On CREATE an absent
 * optional is simply omitted, and a populated value (or an explicit `null`) is
 * always sent as-is.
 */
function toPetBody(
  input: PetInput,
  mode: 'create' | 'update',
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.name,
    species: speciesToWire(input.species),
  };

  const putOptional = (key: keyof PetInput, value: unknown): void => {
    if (value !== undefined) {
      body[key] = value;
    } else if (mode === 'update') {
      // Cleared on the edit form → clear it server-side.
      body[key] = null;
    }
    // CREATE: absent optionals are omitted.
  };

  putOptional('breed', input.breed);
  putOptional('birthDate', input.birthDate);
  putOptional('weightGrams', input.weightGrams);
  putOptional('dietaryNotes', input.dietaryNotes);
  putOptional('profilePhotoUrl', input.profilePhotoUrl);

  return body;
}

function normalizeListPayload(body: unknown): Pet[] {
  let rows: unknown[] = [];
  if (Array.isArray(body)) {
    rows = body;
  } else if (body && typeof body === 'object') {
    // Backend paginated envelope is `{ data: [...] }`; `pets` kept for fallbacks.
    for (const key of ['data', 'pets'] as const) {
      const value = (body as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        rows = value;
        break;
      }
    }
  }
  return rows.map(mapPet);
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
  const raw = await apiFetch<unknown>(
    `/users/me/pets/${encodeURIComponent(id)}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return mapPet(raw);
}

export async function createPet(
  input: PetInput,
  options: PetsApiOptions = {},
): Promise<Pet> {
  const { accessToken } = options;
  const body = JSON.stringify(toPetBody(input, 'create'));
  const raw = await apiFetch<unknown>(
    '/users/me/pets',
    accessToken
      ? { method: 'POST', body, accessToken }
      : { method: 'POST', body },
  );
  return mapPet(raw);
}

export async function updatePet(
  id: PetId,
  input: PetInput,
  options: PetsApiOptions = {},
): Promise<Pet> {
  const { accessToken } = options;
  const body = JSON.stringify(toPetBody(input, 'update'));
  const raw = await apiFetch<unknown>(
    `/users/me/pets/${encodeURIComponent(id)}`,
    accessToken
      ? { method: 'PATCH', body, accessToken }
      : { method: 'PATCH', body },
  );
  return mapPet(raw);
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
