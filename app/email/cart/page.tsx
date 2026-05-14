import type { Metadata } from 'next';
import { EmailPageShell } from '@/components/email/EmailPageShell';
import { CartRecoveryClient } from '@/components/email/CartRecoveryClient';

export const metadata: Metadata = {
  title: 'Restore cart',
  robots: { index: false, follow: false },
};

interface EmailCartPageProps {
  searchParams: { token?: string | string[] };
}

function readToken(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value.length > 0 && value[0]) return value[0];
  return null;
}

export default function EmailCartPage({ searchParams }: EmailCartPageProps) {
  const token = readToken(searchParams.token);

  if (!token) {
    return (
      <div className="flex justify-center">
        <EmailPageShell>
          <p className="text-warm-700 text-center text-sm">
            This cart-recovery link is invalid — request a fresh email from
            checkout or open the newest message from us.
          </p>
        </EmailPageShell>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <EmailPageShell>
        <CartRecoveryClient token={token} />
      </EmailPageShell>
    </div>
  );
}
