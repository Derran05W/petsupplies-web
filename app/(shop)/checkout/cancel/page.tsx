import { type Metadata } from 'next';
import { CancelContents } from '@/components/checkout/CancelContents';

export const metadata: Metadata = {
  title: 'Checkout cancelled',
  description: 'Your cart is still saved. Pick back up whenever you like.',
};

export default function CheckoutCancelPage() {
  return (
    <section className="bg-paper px-gutter pb-24 pt-12 text-ink md:pt-16">
      <div className="mx-auto flex max-w-wrap flex-col items-center">
        <CancelContents />
      </div>
    </section>
  );
}
