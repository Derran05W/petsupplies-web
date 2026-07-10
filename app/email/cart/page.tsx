import type { Metadata } from 'next';
import { PetIcon, TONE_CLASSES } from '@/components/ui';
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
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              aria-hidden
              className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.amber}`}
            >
              <PetIcon name="bowl" className="size-7" />
            </span>
            <div className="flex flex-col gap-2">
              <p className="font-body text-kicker uppercase text-pine">
                Link expired
              </p>
              <h1 className="font-display text-2xl text-ink">
                This cart link is invalid
              </h1>
              <p className="font-body text-sm leading-body text-ink-secondary">
                Request a fresh email from checkout or open the newest message
                from us.
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
        <CartRecoveryClient token={token} />
      </EmailPageShell>
    </div>
  );
}
