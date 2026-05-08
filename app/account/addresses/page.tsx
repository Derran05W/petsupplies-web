import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AddressBook } from '@/components/account/addresses/AddressBook';

export const metadata: Metadata = {
  title: `Saved addresses · ${brand.name}`,
};

/**
 * `/account/addresses` — server-component shell. The CRUD itself runs
 * inside the `<AddressBook />` client island so optimistic updates can
 * surf React Query's mutation cache without forcing route revalidation.
 */
export default function AddressesPage() {
  return (
    <>
      <PageHeader
        heading="Saved addresses"
        description="Manage the addresses you ship to most often."
      />
      <AddressBook />
    </>
  );
}
