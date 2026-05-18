'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  createPet,
  deletePet,
  updatePet,
  listPets,
  type PetInput,
} from '@/lib/api/pets';
import type { Pet, PetId } from '@/types/pet';

export const PETS_QUERY_KEY = ['account', 'pets'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

function optimisticPet(input: PetInput): Pet {
  const now = new Date().toISOString();
  return {
    id: `temp_${Date.now()}`,
    name: input.name,
    species: input.species,
    ...(input.breed !== undefined ? { breed: input.breed } : {}),
    ...(input.birthDate !== undefined ? { birthDate: input.birthDate } : {}),
    ...(input.weightGrams !== undefined
      ? { weightGrams: input.weightGrams }
      : {}),
    ...(input.dietaryNotes !== undefined
      ? { dietaryNotes: input.dietaryNotes }
      : {}),
    ...(input.profilePhotoUrl !== undefined
      ? { profilePhotoUrl: input.profilePhotoUrl }
      : {}),
    createdAt: now,
    updatedAt: now,
  };
}

export function usePetsQuery(): UseQueryResult<Pet[], Error> {
  return useQuery({
    queryKey: PETS_QUERY_KEY,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return listPets(accessToken ? { accessToken } : {});
    },
    staleTime: 60_000,
  });
}

export function useCreatePetMutation(): UseMutationResult<
  Pet,
  Error,
  PetInput,
  { previous: Pet[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PetInput) => {
      const accessToken = await getBrowserAccessToken();
      return createPet(input, accessToken ? { accessToken } : {});
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: PETS_QUERY_KEY });
      const previous = queryClient.getQueryData<Pet[]>(PETS_QUERY_KEY);
      const optimistic = optimisticPet(input);
      queryClient.setQueryData<Pet[]>(PETS_QUERY_KEY, [
        ...(previous ?? []),
        optimistic,
      ]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(PETS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
    },
  });
}

export function useUpdatePetMutation(): UseMutationResult<
  Pet,
  Error,
  { id: PetId; input: PetInput },
  { previous: Pet[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }) => {
      const accessToken = await getBrowserAccessToken();
      return updatePet(id, input, accessToken ? { accessToken } : {});
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: PETS_QUERY_KEY });
      const previous = queryClient.getQueryData<Pet[]>(PETS_QUERY_KEY);
      if (!previous) return { previous };

      const next = previous.map((p) =>
        p.id === id
          ? {
              ...p,
              name: input.name,
              species: input.species,
              breed: input.breed,
              birthDate: input.birthDate,
              weightGrams: input.weightGrams,
              dietaryNotes: input.dietaryNotes,
              profilePhotoUrl: input.profilePhotoUrl,
              updatedAt: new Date().toISOString(),
            }
          : p,
      );

      queryClient.setQueryData<Pet[]>(PETS_QUERY_KEY, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(PETS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
    },
  });
}

export function useDeletePetMutation(): UseMutationResult<
  void,
  Error,
  PetId,
  { previous: Pet[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: PetId) => {
      const accessToken = await getBrowserAccessToken();
      await deletePet(id, accessToken ? { accessToken } : {});
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PETS_QUERY_KEY });
      const previous = queryClient.getQueryData<Pet[]>(PETS_QUERY_KEY);
      if (!previous) return { previous };
      queryClient.setQueryData<Pet[]>(
        PETS_QUERY_KEY,
        previous.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(PETS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
    },
  });
}
