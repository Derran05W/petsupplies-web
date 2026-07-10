import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui';
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

  const maskedEmail = order.email ? maskEmail(order.email) : null;

  return (
    <div className="flex justify-center">
      <article
        aria-label="Order summary"
        className="w-full max-w-2xl rounded-card border border-line bg-panel px-6 py-8 md:px-10 md:py-10"
      >
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="font-body text-kicker uppercase text-pine">Receipt</p>
          <h1 className="font-display text-display text-ink">Your order</h1>
          {maskedEmail ? (
            <p className="font-body text-sm leading-body text-ink-secondary">
              Receipt also sent to{' '}
              <span className="font-medium text-ink">{maskedEmail}</span>.
            </p>
          ) : null}
          <span className="mt-1 inline-flex items-center rounded-tag border border-line bg-paper px-3 py-1 font-body text-micro uppercase text-ink-secondary">
            Order #{order.id.slice(-8)}
          </span>
        </header>

        <OrderReceiptBody order={order} />

        <div className="mt-8">
          <Button href="/products" className="w-full sm:w-auto">
            Continue shopping
          </Button>
        </div>

        <p className="mt-4 text-center font-body text-xs text-ink-faint">
          Questions? Email{' '}
          <a
            href={`mailto:${brand.supportEmail}`}
            className="text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            {brand.supportEmail}
          </a>
          .
        </p>
      </article>
    </div>
  );
}
