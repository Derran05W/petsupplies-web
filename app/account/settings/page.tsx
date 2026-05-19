import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/account/PageHeader';
import { ProfileSection } from '@/components/account/settings/sections/ProfileSection';
import { SecuritySection } from '@/components/account/settings/sections/SecuritySection';
import { NotificationsSection } from '@/components/account/settings/sections/NotificationsSection';
import { AddressesSection } from '@/components/account/settings/sections/AddressesSection';
import { PaymentMethodsSection } from '@/components/account/settings/sections/PaymentMethodsSection';
import { PrivacySection } from '@/components/account/settings/sections/PrivacySection';
import { PreferencesSection } from '@/components/account/settings/sections/PreferencesSection';
import { HelpSection } from '@/components/account/settings/sections/HelpSection';
import { DangerZoneSection } from '@/components/account/settings/sections/DangerZoneSection';
import { parseNotificationPrefs } from '@/lib/account/notification-prefs';

export const metadata: Metadata = {
  title: `Settings · ${brand.name}`,
};

function readName(meta: Record<string, unknown> | null | undefined): string {
  const name = meta?.['name'];
  if (typeof name === 'string') return name;
  return '';
}

/**
 * `/account/settings` — sectioned hub for profile, security, notifications,
 * and related preferences. Hash anchors (`#profile`, …) match shortcuts in
 * the global settings drawer.
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account/settings');

  const meta = user.user_metadata as Record<string, unknown> | null;
  const name = readName(meta);
  const email = user.email ?? '';
  const notificationPrefs = parseNotificationPrefs(meta);

  return (
    <>
      <PageHeader
        heading="Settings"
        description="Manage your profile, security, notifications, and preferences."
      />
      <div className="flex flex-col gap-10 lg:gap-12">
        <ProfileSection initialName={name} initialEmail={email} />
        <SecuritySection email={email} />
        <NotificationsSection initialPrefs={notificationPrefs} />
        <AddressesSection />
        <PaymentMethodsSection />
        <PrivacySection />
        <PreferencesSection />
        <HelpSection />
        <DangerZoneSection />
      </div>
    </>
  );
}
