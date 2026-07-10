import { type Metadata } from 'next';
import Link from 'next/link';
import { CartContents } from '@/components/cart/CartContents';

export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review the items in your cart and continue to checkout.',
};

export default function CartPage() {
  return (
    <section className="bg-paper px-gutter pb-24 pt-12 text-ink md:pt-16">
      <div className="mx-auto max-w-wrap">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 font-body text-micro uppercase text-ink-muted"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/products"
                className="transition-colors duration-fast hover:text-ink"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden className="text-ink-faint">
              /
            </li>
            <li aria-current="page" className="truncate text-ink">
              Your cart
            </li>
          </ol>
        </nav>

        <header className="mb-10 flex flex-col gap-3">
          <p className="font-body text-kicker uppercase text-pine">Cart</p>
          <h1 className="font-display text-display text-ink">Your cart</h1>
        </header>

        <CartContents variant="page" />
      </div>
    </section>
  );
}
