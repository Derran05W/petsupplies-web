import { type Metadata } from 'next';
import { CancelContents } from '@/components/checkout/CancelContents';

export const metadata: Metadata = {
  title: 'Checkout cancelled',
  description: 'Your cart is still saved. Pick back up whenever you like.',
};

export default function CheckoutCancelPage() {
  return (
    <section className="px-6 pb-20 pt-12 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <CancelContents />
      </div>
    </section>
  );
}
