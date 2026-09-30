import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  createPet,
  deletePet,
  getPet,
  isPetCapacityApiError,
  listPets,
  updatePet,
} from '@/lib/api/pets';
import type { Pet } from '@/types/pet';

/** Real backend `PetPublic` wire shape: uppercase species, ISO birthDate, nulls. */
const API_PET = {
  id: 'pet-1',
  userId: 'u1',
  name: 'Luna',
  species: 'CAT',
  breed: 'Domestic',
  birthDate: '2020-01-15T00:00:00.000Z',
  weightGrams: 4500,
  dietaryNotes: 'Grain-free preferred',
  profilePhotoUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

/** The app `Pet` the mapper should produce from `API_PET`. */
const MAPPED_PET: Pet = {
  id: 'pet-1',
  name: 'Luna',
  species: 'cat',
  breed: 'Domestic',
  birthDate: '2020-01-15',
  weightGrams: 4500,
  dietaryNotes: 'Grain-free preferred',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('lib/api/pets', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET /users/me/pets unwraps the { data: [...] } envelope and maps species/birthDate', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { data: [API_PET], page: 1, limit: 20, total: 1, totalPages: 1 },
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const rows = await listPets({ accessToken: 'tok' });
    expect(rows).toEqual([MAPPED_PET]);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/pets',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET /users/me/pets maps a bare array payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json([API_PET], { status: 200 })),
    );

    const rows = await listPets({});
    expect(rows).toEqual([MAPPED_PET]);
  });

  it('GET fails with ApiError on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ message: 'Unauthorized' }, { status: 401 }),
      ),
    );

    await expect(listPets({ accessToken: 'bad' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    });
  });

  it('GET one returns the mapped Pet on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(API_PET, { status: 200 })),
    );

    const pet = await getPet('pet-1', { accessToken: 'tok' });
    expect(pet).toEqual(MAPPED_PET);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/pets/pet-1',
      expect.anything(),
    );
  });

  it('GET one throws ApiError 404 when not found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ message: 'Not found' }, { status: 404 }),
      ),
    );

    await expect(getPet('other', {})).rejects.toBeInstanceOf(ApiError);
  });

  it('POST uppercases species and omits userId', async () => {
    const input = {
      name: 'Rex',
      species: 'dog' as const,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { ...API_PET, name: 'Rex', species: 'DOG' },
          {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );

    await createPet(input, { accessToken: 't' });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/pets',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Rex', species: 'DOG' }),
      }),
    );
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]![1]!.body as string);
    expect(body).not.toHaveProperty('userId');
    expect(body.species).toBe('DOG');
  });

  it('PATCH serialises the uppercase-species payload and nulls the absent optional', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ ...API_PET, name: 'Updated' }, { status: 200 }),
      ),
    );

    // profilePhotoUrl is absent from the patch: on the UPDATE path that means
    // the user cleared it, so the body carries an explicit `null` to clear it.
    const patchBody = {
      name: 'Updated',
      species: 'cat' as const,
      breed: 'Domestic',
      birthDate: '2020-01-15',
      weightGrams: 4500,
      dietaryNotes: 'Grain-free preferred',
    };

    await updatePet('pet-1', patchBody, { accessToken: 't' });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/pets/pet-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated',
          species: 'CAT',
          breed: 'Domestic',
          birthDate: '2020-01-15',
          weightGrams: 4500,
          dietaryNotes: 'Grain-free preferred',
          profilePhotoUrl: null,
        }),
      }),
    );
  });

  it('PATCH sends null for every optional the user cleared (null-to-clear)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ ...API_PET, name: 'Cleared' }, { status: 200 }),
      ),
    );

    // Only name + species survive editing; every optional was emptied. The
    // edit form submits the complete profile, so each absent optional must
    // reach the backend as `null` (clear), not be omitted (which silently
    // left the old value in place — the bug this guards).
    await updatePet(
      'pet-1',
      { name: 'Cleared', species: 'cat' },
      { accessToken: 't' },
    );

    const body = JSON.parse(
      vi.mocked(fetch).mock.calls[0]![1]!.body as string,
    ) as Record<string, unknown>;
    expect(body).toEqual({
      name: 'Cleared',
      species: 'CAT',
      breed: null,
      birthDate: null,
      weightGrams: null,
      dietaryNotes: null,
      profilePhotoUrl: null,
    });
  });

  it('PATCH keeps populated optionals and nulls only the cleared ones (omit-unchanged vs clear)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ ...API_PET }, { status: 200 })),
    );

    // breed is still populated (unchanged), the rest were cleared.
    await updatePet(
      'pet-1',
      { name: 'Luna', species: 'cat', breed: 'Domestic' },
      { accessToken: 't' },
    );

    const body = JSON.parse(
      vi.mocked(fetch).mock.calls[0]![1]!.body as string,
    ) as Record<string, unknown>;
    expect(body.breed).toBe('Domestic');
    expect(body.birthDate).toBeNull();
    expect(body.weightGrams).toBeNull();
    expect(body.dietaryNotes).toBeNull();
    expect(body.profilePhotoUrl).toBeNull();
  });

  it('POST omits absent optionals — never sends null on create', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { ...API_PET, name: 'Rex', species: 'DOG', breed: 'Husky' },
          { status: 201 },
        ),
      ),
    );

    await createPet(
      { name: 'Rex', species: 'dog', breed: 'Husky' },
      { accessToken: 't' },
    );

    const body = JSON.parse(
      vi.mocked(fetch).mock.calls[0]![1]!.body as string,
    ) as Record<string, unknown>;
    // The provided optional is sent; the absent ones are omitted, not nulled.
    expect(body).toEqual({ name: 'Rex', species: 'DOG', breed: 'Husky' });
    expect(body).not.toHaveProperty('birthDate');
    expect(body).not.toHaveProperty('weightGrams');
    expect(body).not.toHaveProperty('dietaryNotes');
    expect(body).not.toHaveProperty('profilePhotoUrl');
  });

  it('DELETE returns void on 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(null, {
            status: 204,
            headers: {},
          }),
      ),
    );

    await expect(
      deletePet('pet-1', { accessToken: 't' }),
    ).resolves.toBeUndefined();
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/pets/pet-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('422 validation errors propagate validationErrors map', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            message: 'Invalid',
            errors: { name: ['Too short'] },
          },
          { status: 422 },
        ),
      ),
    );

    await expect(
      createPet({ name: '', species: 'dog' }, {}),
    ).rejects.toMatchObject({
      status: 422,
      validationErrors: { name: ['Too short'] },
    });
  });

  it('capacity helper recognises typical 422 copy', () => {
    expect(isPetCapacityApiError('Maximum ten pets exceeded', 422)).toBe(true);
    expect(isPetCapacityApiError('broken', 422)).toBe(false);
    expect(isPetCapacityApiError('max', 400)).toBe(false);
  });

  it('network failure throws ApiError status 0', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(listPets({ accessToken: 't' })).rejects.toMatchObject({
      status: 0,
      isNetworkError: true,
    });
  });
});
