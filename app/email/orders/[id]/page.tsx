import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderReceiptBody } from '@/components/checkout/OrderReceiptBody';
import { brand } from '@/lib/config/brand';
import { getSharedOrder } from '@/lib/api/orders';

export const metadata: Metadata = {
  title: 'Your order',
  robots: { index: false, follow: false },
};

interface SharedOrderPageProps {
  params: { id: string };
  searchParams: { token?: string | string[] };
}

function readToken(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value.length > 0 && value[0]) return value[0];
  return null;
}

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0 || at === email.length - 1) return email;
  const first = email.charAt(0);
  const domainPart = email.slice(at);
  return `${first}***${domainPart}`;
}

export default async function SharedOrderPage({
  params,
  searchParams,
}: SharedOrderPageProps) {
  const token = readToken(searchParams.token);
  if (!token) notFound();

  const order = await getSharedOrder(params.id, token);
  if (!order) notFound();

  const maskedEmail = maskEmail(order.email);

  return (
    <div className="flex justify-center">
      <article
        aria-label="Order summary"
        className="w-full max-w-2xl rounded-2xl border border-warm-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10"
      >
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900 md:text-4xl">
            Your order
          </h1>
          <p className="font-body text-sm text-warm-600">
            Receipt also sent to{' '}
            <span className="font-medium text-warm-900">{maskedEmail}</span>.
          </p>
          <span className="mt-1 inline-flex items-center rounded-full bg-warm-100 px-3 py-1 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
            Order #{order.id.slice(-8)}
          </span>
        </header>

        <OrderReceiptBody order={order} />

        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 sm:w-auto"
          >
            Continue shopping
          </Link>
        </div>

        <p className="mt-4 text-center font-body text-xs text-warm-400">
          Questions? Email{' '}
          <a
            href={`mailto:${brand.supportEmail}`}
            className="text-warm-600 underline-offset-2 hover:text-warm-900 hover:underline"
          >
            {brand.supportEmail}
          </a>
          .
        </p>
      </article>
    </div>
  );
}
