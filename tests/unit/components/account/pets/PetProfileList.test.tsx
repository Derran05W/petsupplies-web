import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PetProfileList } from '@/components/account/pets/PetProfileList';

const stubs = vi.hoisted(() => ({
  usePetsQuery: vi.fn(),
  useCreatePetMutation: vi.fn(),
  useUpdatePetMutation: vi.fn(),
  useDeletePetMutation: vi.fn(),
}));

vi.mock('@/hooks/usePets', () => ({
  PETS_QUERY_KEY: ['account', 'pets'],
  usePetsQuery: stubs.usePetsQuery,
  useCreatePetMutation: stubs.useCreatePetMutation,
  useUpdatePetMutation: stubs.useUpdatePetMutation,
  useDeletePetMutation: stubs.useDeletePetMutation,
}));

function Provider({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  stubs.usePetsQuery.mockReset();
  stubs.useCreatePetMutation.mockReset();
  stubs.useUpdatePetMutation.mockReset();
  stubs.useDeletePetMutation.mockReset();

  stubs.useCreatePetMutation.mockReturnValue({
    mutateAsync: vi.fn(),
    mutate: vi.fn(),
    isPending: false,
  });
  stubs.useUpdatePetMutation.mockReturnValue({
    mutateAsync: vi.fn(),
    mutate: vi.fn(),
    isPending: false,
  });
  stubs.useDeletePetMutation.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  });
});

describe('PetProfileList', () => {
  it('shows the empty-state CTA when the list resolves empty', async () => {
    stubs.usePetsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    render(
      <Provider>
        <PetProfileList />
      </Provider>,
    );

    expect(
      screen.getByRole('heading', { name: /no pet profiles yet/i }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add your first pet/i }),
      ).toBeInTheDocument();
    });
  });

  it('renders saved pet cards when query returns pets', async () => {
    stubs.usePetsQuery.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'p1',
          name: 'Loki',
          species: 'cat',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    render(
      <Provider>
        <PetProfileList />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Loki')).toBeInTheDocument();
    });
  });
});
