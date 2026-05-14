import Link from 'next/link';
import type { Metadata } from 'next';
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
    <div className="min-h-screen bg-warm-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="mb-6 text-center">
          <Link
            href="/"
            className="text-warm-500 font-body text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:text-brand-600"
          >
            {brand.name}
          </Link>
        </p>
        {children}
      </div>
    </div>
  );
}
