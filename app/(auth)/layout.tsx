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
          {(() => {
            const words = brand.name.split(' ');
            const n = brand.logoAccentWords ?? 1;
            const accent = words.slice(0, n).join(' ');
            const rest = words.slice(n).join(' ');
            return (
              <>
                <span className="text-brand-600">{accent}</span>
                {rest && <span>{rest}</span>}
              </>
            );
          })()}
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
