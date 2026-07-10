import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PetIcon, TONE_CLASSES } from '@/components/ui';
import { EmailPageShell } from '@/components/email/EmailPageShell';
import { brand } from '@/lib/config/brand';

export const metadata: Metadata = {
  title: 'Your order link',
  robots: { index: false, follow: false },
};

interface EmailOrderPageProps {
  searchParams: { id?: string | string[]; token?: string | string[] };
}

function readParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value.length > 0 && value[0]) return value[0];
  return null;
}

export default function EmailOrderPage({ searchParams }: EmailOrderPageProps) {
  const id = readParam(searchParams.id);
  const token = readParam(searchParams.token);

  if (id && token) {
    redirect(
      `/email/orders/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`,
    );
  }

  return (
    <div className="flex justify-center">
      <EmailPageShell>
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            aria-hidden
            className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.slate}`}
          >
            <PetIcon name="bone" className="size-7" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="font-body text-kicker uppercase text-pine">
              Link expired
            </p>
            <h1 className="font-display text-2xl text-ink">
              That order link is invalid
            </h1>
            <p className="font-body text-sm leading-body text-ink-secondary">
              Open your latest {brand.name} email for a working link.
            </p>
          </div>
        </div>
      </EmailPageShell>
    </div>
  );
}
