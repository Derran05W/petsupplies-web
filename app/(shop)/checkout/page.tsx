import { type Metadata } from 'next';
import { CheckoutHeading } from '@/components/checkout/CheckoutHeading';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Enter your shipping details and continue to secure payment via Stripe.',
};

export default function CheckoutPage() {
  return (
    <section className="bg-paper px-gutter pb-24 pt-12 text-ink md:pt-16">
      <div className="mx-auto flex max-w-wrap flex-col gap-8">
        <CheckoutHeading />
        <CheckoutClient />
      </div>
    </section>
  );
}
