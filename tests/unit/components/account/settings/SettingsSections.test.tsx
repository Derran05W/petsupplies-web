/**
 * Settings hub sections expose stable hash targets for the global drawer.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/site/settings', () => ({
  fetchSiteSettings: vi.fn(),
  SITE_SETTINGS_CACHE_TAG: 'site-settings',
}));
import { render } from '@testing-library/react';
import { ProfileSection } from '@/components/account/settings/sections/ProfileSection';
import { SecuritySection } from '@/components/account/settings/sections/SecuritySection';
import { NotificationsSection } from '@/components/account/settings/sections/NotificationsSection';
import { AddressesSection } from '@/components/account/settings/sections/AddressesSection';
import { PaymentMethodsSection } from '@/components/account/settings/sections/PaymentMethodsSection';
import { PrivacySection } from '@/components/account/settings/sections/PrivacySection';
import { PreferencesSection } from '@/components/account/settings/sections/PreferencesSection';
import { HelpSection } from '@/components/account/settings/sections/HelpSection';
import { DangerZoneSection } from '@/components/account/settings/sections/DangerZoneSection';

vi.mock('@/components/account/settings/SettingsForm', () => ({
  SettingsForm: () => <div data-testid="settings-form-stub" />,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  })),
}));

vi.mock('@/components/providers/ThemeProvider', () => ({
  useTheme: () => ({
    preferences: { appearance: 'light' },
    resolvedTheme: 'light',
    setPreferences: vi.fn().mockResolvedValue(undefined),
    saving: false,
  }),
}));

describe('account settings sections', () => {
  const SECTION_IDS = [
    'profile',
    'security',
    'notifications',
    'addresses',
    'payments',
    'privacy',
    'preferences',
    'help',
    'danger',
  ] as const;

  it('each section exposes its scroll anchor id', () => {
    const { container: c1 } = render(
      <ProfileSection initialName="Jane" initialEmail="jane@example.com" />,
    );
    const { container: c2 } = render(
      <SecuritySection email="jane@example.com" />,
    );
    const { container: c3 } = render(
      <NotificationsSection initialPrefs={{}} />,
    );
    const { container: c4 } = render(<AddressesSection />);
    const { container: c5 } = render(<PaymentMethodsSection />);
    const { container: c6 } = render(<PrivacySection />);
    const { container: c7 } = render(<PreferencesSection />);
    const { container: c8 } = render(<HelpSection />);
    const { container: c9 } = render(<DangerZoneSection />);

    const roots = [c1, c2, c3, c4, c5, c6, c7, c8, c9];
    SECTION_IDS.forEach((id, i) => {
      const root = roots[i];
      expect(root?.querySelector(`#${id}`)).not.toBeNull();
    });
  });
});
