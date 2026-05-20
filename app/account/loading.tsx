import { PageHeader } from '@/components/account/PageHeader';
import { AccountOrdersLoading } from '@/components/account/AccountOrdersLoading';

/**
 * Instant feedback while `/account/*` routes stream in after navigation.
 */
export default function AccountLoading() {
  return (
    <>
      <PageHeader
        heading="Your orders"
        description="Everything you've ordered, with status and tracking when available."
      />
      <AccountOrdersLoading />
    </>
  );
}
