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

const SAMPLE_PET = {
  id: 'pet-1',
  name: 'Luna',
  species: 'cat' as const,
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

  it('GET /users/me/pets parses a bare Pet[] payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json([SAMPLE_PET], {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const rows = await listPets({ accessToken: 'tok' });
    expect(rows).toEqual([SAMPLE_PET]);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/pets',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET /users/me/pets normalises pets[] wrapper objects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ pets: [SAMPLE_PET] }, { status: 200 })),
    );

    const rows = await listPets({});
    expect(rows).toEqual([SAMPLE_PET]);
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

  it('GET one returns Pet on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(SAMPLE_PET, { status: 200 })),
    );

    const pet = await getPet('pet-1', { accessToken: 'tok' });
    expect(pet).toEqual(SAMPLE_PET);
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

  it('POST serialises PetInput JSON without userId field', async () => {
    const input = {
      name: 'Rex',
      species: 'dog' as const,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { ...SAMPLE_PET, ...input },
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
        body: JSON.stringify(input),
      }),
    );
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0]![1]!.body as string);
    expect(body).not.toHaveProperty('userId');
  });

  it('PATCH serialises payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ ...SAMPLE_PET, name: 'Updated' }, { status: 200 }),
      ),
    );

    const patchBody = {
      name: 'Updated',
      species: 'cat' as const,
      breed: SAMPLE_PET.breed,
      birthDate: SAMPLE_PET.birthDate,
      weightGrams: SAMPLE_PET.weightGrams,
      dietaryNotes: SAMPLE_PET.dietaryNotes,
    };

    await updatePet(SAMPLE_PET.id, patchBody, { accessToken: 't' });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      `http://localhost:3001/users/me/pets/${SAMPLE_PET.id}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(patchBody),
      }),
    );
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
      deletePet(SAMPLE_PET.id, { accessToken: 't' }),
    ).resolves.toBeUndefined();
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      `http://localhost:3001/users/me/pets/${SAMPLE_PET.id}`,
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
