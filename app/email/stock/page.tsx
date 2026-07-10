import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PetIcon, TONE_CLASSES } from '@/components/ui';
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

function InvalidStockLink({ body }: { body: string }) {
  return (
    <div className="flex justify-center">
      <EmailPageShell>
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            aria-hidden
            className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.clay}`}
          >
            <PetIcon name="fish" className="size-7" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="font-body text-kicker uppercase text-pine">
              Link expired
            </p>
            <h1 className="font-display text-2xl text-ink">
              This notification link is invalid
            </h1>
            <p className="font-body text-sm leading-body text-ink-secondary">
              {body}
            </p>
          </div>
        </div>
      </EmailPageShell>
    </div>
  );
}

export default function EmailStockPage({ searchParams }: EmailStockPageProps) {
  const slug = readParam(searchParams.slug);
  if (slug) {
    redirect(`/products/${encodeURIComponent(slug)}`);
  }

  const productId = readParam(searchParams.productId);
  if (productId) {
    return (
      <InvalidStockLink body="We couldn't open that product — use the newest email from us to find it." />
    );
  }

  return (
    <InvalidStockLink body="Use the newest email from us to jump back to the item you saved." />
  );
}
