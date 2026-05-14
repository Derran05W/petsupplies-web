import type { Metadata } from 'next';
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
          <p className="text-warm-700 text-center text-sm">
            This preferences link looks invalid or has expired — use the secure
            link from your latest email.
          </p>
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
