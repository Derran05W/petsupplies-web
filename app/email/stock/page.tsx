import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { EmailPageShell } from '@/components/email/EmailPageShell';

export const metadata: Metadata = {
  title: 'Back in stock',
  robots: { index: false, follow: false },
};

interface EmailStockPageProps {
  searchParams: { slug?: string | string[]; productId?: string | string[] };
}

function readParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value.length > 0 && value[0]) return value[0];
  return null;
}

export default function EmailStockPage({ searchParams }: EmailStockPageProps) {
  const slug = readParam(searchParams.slug);
  if (slug) {
    redirect(`/products/${encodeURIComponent(slug)}`);
  }

  const productId = readParam(searchParams.productId);
  if (productId) {
    return (
      <div className="flex justify-center">
        <EmailPageShell>
          <p className="text-warm-700 text-center text-sm">Invalid link</p>
        </EmailPageShell>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <EmailPageShell>
        <p className="text-warm-700 text-center text-sm">
          This notification link looks invalid — use the newest email from us.
        </p>
      </EmailPageShell>
    </div>
  );
}
