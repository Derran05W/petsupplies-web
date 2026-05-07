import Link from 'next/link';
import { brand } from '@/lib/config/brand';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-warm-50">
      <header className="px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-baseline gap-0.5 font-body text-lg font-medium text-warm-900"
        >
          <span className="text-brand-600">{brand.name.slice(0, 3)}</span>
          <span>{brand.name.slice(3)}</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
