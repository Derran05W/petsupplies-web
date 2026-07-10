import Link from 'next/link';
import type { Metadata } from 'next';
import { WORDMARK_CLASSES } from '@/components/ui';
import { brand } from '@/lib/config/brand';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-gutter py-16">
        <p className="mb-10 text-center">
          <Link href="/" className={WORDMARK_CLASSES}>
            {brand.name}
          </Link>
        </p>
        {children}
      </div>
    </div>
  );
}
