/**
 * Covers `<ProductForm />` from
 * `components/admin/products/ProductForm.tsx`, focused on the multi-category
 * and optional-ingredients features.
 *
 * What's covered:
 *   - the "Add Ingredients" checkbox reveals (and hides) the ingredients
 *     textarea.
 *   - submitting the create form sends the selected `categories` array plus
 *     `category = categories[0]` for back-compat.
 *   - with "Add Ingredients" left unchecked, the submitted input carries no
 *     ingredients value (the wire mapper turns this into `null` — see
 *     `admin-product-mapper.test.ts`).
 *
 * Mock boundary:
 *   - `@/hooks/useAdminProducts` so no real mutation / network runs.
 *   - `@/components/admin/products/ImageUploader` → a stub button that seeds a
 *     valid image so the schema's "at least one image" rule passes.
 *   - `@/components/admin/products/AiDescriptionBtn` → rendered inert (its real
 *     body pulls in Supabase + streaming and is tested separately).
 *   - `next/navigation` for the router + search params.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from '@/components/admin/products/ProductForm';

const createMutateAsync = vi.fn().mockResolvedValue({ id: 'new-prod' });
const updateMutateAsync = vi.fn().mockResolvedValue({ id: 'prod-1' });
const deleteMutateAsync = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useAdminProducts', () => ({
  useCreateAdminProductMutation: () => ({
    mutateAsync: createMutateAsync,
    isPending: false,
  }),
  useUpdateAdminProductMutation: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
  }),
  useDeleteAdminProductMutation: () => ({
    mutateAsync: deleteMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/components/admin/products/ImageUploader', () => ({
  ImageUploader: ({ onChange }: { onChange: (images: unknown[]) => void }) => (
    <button
      type="button"
      onClick={() =>
        onChange([
          {
            id: 'img-1',
            url: 'https://cdn.example.com/a.jpg',
            alt: 'Product photo',
            isPrimary: true,
          },
        ])
      }
    >
      seed-image
    </button>
  ),
}));

vi.mock('@/components/admin/products/AiDescriptionBtn', () => ({
  AiDescriptionBtn: () => null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  createMutateAsync.mockClear();
  updateMutateAsync.mockClear();
  deleteMutateAsync.mockClear();
});

const INGREDIENTS_PLACEHOLDER = 'List the ingredients, separated by commas…';

describe('ProductForm — ingredients toggle', () => {
  it('reveals and hides the ingredients textarea via the checkbox', async () => {
    const user = userEvent.setup();
    render(<ProductForm initialProduct={null} />);

    expect(
      screen.queryByPlaceholderText(INGREDIENTS_PLACEHOLDER),
    ).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Add Ingredients'));
    expect(
      screen.getByPlaceholderText(INGREDIENTS_PLACEHOLDER),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText('Add Ingredients'));
    expect(
      screen.queryByPlaceholderText(INGREDIENTS_PLACEHOLDER),
    ).not.toBeInTheDocument();
  });
});

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Product name'), 'Salmon Treats');
  // Blur the name so the slug auto-fills.
  await user.tab();
  await user.type(
    screen.getByPlaceholderText(/Tell shoppers/i),
    'Tasty salmon treats for good dogs.',
  );
  await user.type(screen.getByLabelText('Price (CAD)'), '12.99');
  await user.click(screen.getByText('seed-image'));
}

describe('ProductForm — multi-category submit', () => {
  it('sends the categories array plus category = categories[0]', async () => {
    const user = userEvent.setup();
    render(<ProductForm initialProduct={null} />);

    await fillRequiredFields(user);
    await user.click(screen.getByLabelText('Dog'));
    await user.click(screen.getByLabelText('Cat'));

    await user.click(screen.getByRole('button', { name: /create product/i }));

    expect(createMutateAsync).toHaveBeenCalledTimes(1);
    const input = createMutateAsync.mock.calls[0]![0];
    expect(input.categories).toEqual(['DOG', 'CAT']);
    expect(input.category).toBe('DOG');
    expect(input.category).toBe(input.categories[0]);
  });

  it('submits no ingredients value when the checkbox is unchecked', async () => {
    const user = userEvent.setup();
    render(<ProductForm initialProduct={null} />);

    await fillRequiredFields(user);
    await user.click(screen.getByLabelText('Dog'));

    await user.click(screen.getByRole('button', { name: /create product/i }));

    expect(createMutateAsync).toHaveBeenCalledTimes(1);
    const input = createMutateAsync.mock.calls[0]![0];
    expect(input.ingredients).toBeUndefined();
  });
});
