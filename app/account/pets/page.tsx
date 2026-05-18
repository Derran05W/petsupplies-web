import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { PetProfileList } from '@/components/account/pets/PetProfileList';

export const metadata: Metadata = {
  title: `Your pets · ${brand.name}`,
};

/**
 * `/account/pets` — server shell; CRUD happens in `<PetProfileList />`
 * for optimistic TanStack mutations.
 */
export default function PetsPage() {
  return (
    <>
      <PageHeader
        heading="Your pets"
        description="Tell us about your pets — we'll personalize your experience."
      />
      <PetProfileList />
    </>
  );
}
