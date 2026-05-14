import type { Metadata } from 'next';
import { EmailPageShell } from '@/components/email/EmailPageShell';
import { UnsubscribeEmailClient } from '@/components/email/UnsubscribeEmailClient';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
};

interface EmailUnsubscribePageProps {
  searchParams: { token?: string | string[] };
}

function readToken(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value.length > 0 && value[0]) return value[0];
  return null;
}

export default function EmailUnsubscribePage({
  searchParams,
}: EmailUnsubscribePageProps) {
  const token = readToken(searchParams.token);

  if (!token) {
    return (
      <div className="flex justify-center">
        <EmailPageShell>
          <p className="text-warm-700 text-center text-sm">
            This unsubscribe link looks invalid or has expired — open the newest
            message from us and tap the link there.
          </p>
        </EmailPageShell>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <EmailPageShell>
        <UnsubscribeEmailClient token={token} />
      </EmailPageShell>
    </div>
  );
}
