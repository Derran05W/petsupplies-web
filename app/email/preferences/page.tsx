import type { Metadata } from 'next';
import { PetIcon, TONE_CLASSES } from '@/components/ui';
import { EmailPageShell } from '@/components/email/EmailPageShell';
import { PreferencesEmailClient } from '@/components/email/PreferencesEmailClient';

export const metadata: Metadata = {
  title: 'Email preferences',
  robots: { index: false, follow: false },
};

interface EmailPreferencesPageProps {
  searchParams: { token?: string | string[] };
}

function readToken(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value.length > 0 && value[0]) return value[0];
  return null;
}

export default function EmailPreferencesPage({
  searchParams,
}: EmailPreferencesPageProps) {
  const token = readToken(searchParams.token);

  if (!token) {
    return (
      <div className="flex justify-center">
        <EmailPageShell>
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              aria-hidden
              className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.sage}`}
            >
              <PetIcon name="paw" className="size-7" />
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-body text-kicker uppercase text-pine">
                Link expired
              </p>
              <h1 className="font-display text-2xl text-ink">
                This preferences link is invalid
              </h1>
              <p className="font-body text-sm leading-body text-ink-secondary">
                Use the secure link from your latest email to manage your
                preferences.
              </p>
            </div>
          </div>
        </EmailPageShell>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <EmailPageShell>
        <PreferencesEmailClient token={token} />
      </EmailPageShell>
    </div>
  );
}
