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
    <section className="px-6 pb-20 pt-8 md:px-8 md:pt-12 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <CheckoutHeading />
        <CheckoutClient />
      </div>
    </section>
  );
}
