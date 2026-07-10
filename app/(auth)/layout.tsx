import { brand } from '@/lib/config/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-paper text-ink">
      <header className="border-b border-line px-gutter py-5">
        <BrandLogo brand={brand} />
      </header>
      <main className="flex flex-1 items-center justify-center px-gutter py-12">
        {children}
      </main>
    </div>
  );
}
