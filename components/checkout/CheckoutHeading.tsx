import Link from 'next/link';

/**
 * Server component — breadcrumb + Fraunces page heading shared by the
 * `/checkout` page (no JS needed for either piece).
 */
export function CheckoutHeading() {
  return (
    <div>
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
          <li>
            <Link
              href="/cart"
              className="transition-colors hover:text-warm-900"
            >
              Cart
            </Link>
          </li>
          <li aria-hidden className="text-warm-300">
            /
          </li>
          <li
            aria-current="page"
            className="truncate font-medium text-warm-900"
          >
            Checkout
          </li>
        </ol>
      </nav>

      <h1 className="font-display text-4xl leading-tight tracking-[-0.02em] text-warm-900 md:text-5xl">
        Checkout
      </h1>
    </div>
  );
}
