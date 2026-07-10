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
          <li>
            <Link
              href="/cart"
              className="transition-colors duration-fast hover:text-ink"
            >
              Cart
            </Link>
          </li>
          <li aria-hidden className="text-ink-faint">
            /
          </li>
          <li aria-current="page" className="truncate text-ink">
            Checkout
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-3">
        <p className="font-body text-kicker uppercase text-pine">
          Almost there
        </p>
        <h1 className="font-display text-display text-ink">Checkout</h1>
      </div>
    </div>
  );
}
