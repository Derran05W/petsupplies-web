import { type Metadata } from 'next';
import Link from 'next/link';
import { CartContents } from '@/components/cart/CartContents';

export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review the items in your cart and continue to checkout.',
};

export default function CartPage() {
  return (
    <section className="px-6 pb-20 pt-8 md:px-8 md:pt-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 font-body text-sm text-warm-600"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/products"
                className="transition-colors hover:text-warm-900"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden className="text-warm-300">
              /
            </li>
            <li
              aria-current="page"
              className="truncate font-medium text-warm-900"
            >
              Your cart
            </li>
          </ol>
        </nav>

        <h1 className="mb-8 font-display text-4xl leading-tight tracking-[-0.02em] text-warm-900 md:text-5xl">
          Your cart
        </h1>

        <CartContents variant="page" />
      </div>
    </section>
  );
}
