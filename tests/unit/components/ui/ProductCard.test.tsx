/**
 * Covers `<ProductCard />` from `components/ui/ProductCard.tsx` — the
 * boutique image-first card that superseded the legacy
 * `components/product/ProductCard.tsx`.
 *
 * What's covered:
 *   - name + formatted price render, inside a link to `/products/${slug}`.
 *   - alt text on the primary image (and the product-name fallback when
 *     no image entry has an alt).
 *   - quick-add button: calls `useCartActions().add` with the product and
 *     flips its label to "Added ✓" (accessible name still carries the
 *     product name via the sr-only suffix).
 *   - out-of-stock branch swaps the quick-add button for an "Out of
 *     stock" pill.
 *   - sale branch renders the strike-through compare-at price.
 *
 * Mock boundary: `@/hooks/useCart` is mocked so the card's `add` action
 * is a spy — the component itself pulls in no other feature hooks.
 * Fixtures come from `tests/fixtures/products.ts` to avoid pinning to
 * placeholder array indices.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/ui/ProductCard';
import {
  oneFeaturedProduct,
  outOfStockProduct,
  productWithoutSale,
} from '@/tests/fixtures/products';
import { formatPrice } from '@/lib/utils/format';

const add = vi.fn();

vi.mock('@/hooks/useCart', () => ({
  useCartActions: () => ({ add }),
}));

beforeEach(() => {
  add.mockReset();
});

describe('ui/ProductCard', () => {
  it('renders the name and formatted price inside a link to /products/{slug}', () => {
    const product = oneFeaturedProduct();

    render(<ProductCard product={product} />);

    const name = screen.getByText(product.name);
    expect(name).toBeInTheDocument();
    expect(name.closest('a')).toHaveAttribute(
      'href',
      `/products/${product.slug}`,
    );
    expect(
      screen.getByText(formatPrice(product.priceCents)),
    ).toBeInTheDocument();
  });

  it('renders the primary image alt text', () => {
    const product = oneFeaturedProduct();
    const expectedAlt =
      product.images.find((image) => image.isPrimary)?.alt ?? product.name;

    render(<ProductCard product={product} />);

    expect(screen.getByRole('img', { name: expectedAlt })).toBeInTheDocument();
  });

  it('falls back to the product name as alt text when the image has no alt', () => {
    const product = oneFeaturedProduct();
    product.images = product.images.map((image) => ({ ...image, alt: '' }));

    render(<ProductCard product={product} />);

    expect(screen.getByRole('img', { name: product.name })).toBeInTheDocument();
  });

  it('renders the strike-through compare-at price when on sale', () => {
    const product = oneFeaturedProduct();
    expect(product.compareAtPriceCents).toBeDefined();

    render(<ProductCard product={product} />);

    expect(
      screen.getByText(formatPrice(product.compareAtPriceCents as number)),
    ).toBeInTheDocument();
  });

  it('adds the product to the cart and flips the button to "Added" on quick add', async () => {
    const user = userEvent.setup();
    const product = productWithoutSale();

    render(<ProductCard product={product} />);

    const button = screen.getByRole('button', { name: /quick add/i });
    await user.click(button);

    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(product);
    expect(screen.getByRole('button', { name: /added/i })).toBeInTheDocument();
  });

  it('shows an "Out of stock" pill instead of quick add when unavailable', () => {
    const product = outOfStockProduct();
    product.inStock = false;

    render(<ProductCard product={product} />);

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /quick add/i }),
    ).not.toBeInTheDocument();
  });
});
