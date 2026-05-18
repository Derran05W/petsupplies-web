import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { petProfileFormValuesToPetInput } from '@/lib/account/schemas';
import { PetProfileForm } from '@/components/account/pets/PetProfileForm';

describe('PetProfileForm', () => {
  it('surfaces validation for missing species on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PetProfileForm
        onSubmit={async (values) => onSubmit(values)}
        onCancel={() => {}}
        submitLabel="Save"
      />,
    );

    await user.type(screen.getByLabelText('Name'), 'Luna');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText(/pick a species/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('converts kg weight to grams via petProfileFormValuesToPetInput', () => {
    const grams = petProfileFormValuesToPetInput({
      name: 'Rex',
      species: 'dog',
      breed: '',
      birthDate: '',
      dietaryNotes: '',
      profilePhotoUrl: '',
      weightInput: '4.5',
      weightUnit: 'kg',
    });
    expect(grams.weightGrams).toBe(4500);
  });
});
