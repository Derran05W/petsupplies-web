import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/account/PageHeader';
import { SettingsForm } from '@/components/account/settings/SettingsForm';

export const metadata: Metadata = {
  title: `Settings · ${brand.name}`,
};

function readName(meta: Record<string, unknown> | null | undefined): string {
  const name = meta?.['name'];
  if (typeof name === 'string') return name;
  return '';
}

/**
 * `/account/settings` — server-component wrapper. Reads the user's
 * current name + email and passes them to the client form so initial
 * values are server-rendered (no flash, no race with Supabase
 * `getUser()` on mount).
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account/settings');

  const name = readName(user.user_metadata as Record<string, unknown> | null);
  const email = user.email ?? '';

  return (
    <>
      <PageHeader
        heading="Settings"
        description="Update the basics for your account."
      />
      <SettingsForm initialName={name} initialEmail={email} />
    </>
  );
}
