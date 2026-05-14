import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
        <p className="text-warm-700 text-center text-sm">
          That order link is invalid — open your latest {brand.name} email for a
          working link.
        </p>
      </EmailPageShell>
    </div>
  );
}
