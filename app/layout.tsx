import type { Metadata } from 'next';
import { Fraunces, Archivo } from 'next/font/google';
import { getBrand } from '@/lib/config/brand';
import { buildRootMetadata } from '@/lib/site/metadata';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { CartMergeProvider } from '@/components/providers/CartMergeProvider';
import { ThemeScript } from '@/components/theme/ThemeScript';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK'],
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const liveBrand = await getBrand();
  return buildRootMetadata(liveBrand);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="min-h-svh font-body antialiased"
      >
        <ThemeScript />
        <QueryProvider>
          <AuthProvider>
            <CartMergeProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </CartMergeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
