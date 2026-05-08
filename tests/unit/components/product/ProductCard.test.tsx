/**
 * Covers `<ProductCard />` from `components/product/ProductCard.tsx`.
 *
 * What's covered:
 *   - product name renders as an `h3`.
 *   - sale-price branch: when `compareAtPriceCents > priceCents` the
 *     "Sale" badge AND the strike-through compare-at price render.
 *   - out-of-stock branch: badge swaps to "Out of stock" and Sale is
 *     suppressed.
 *   - rating chip renders when `rating` is present and is omitted when
 *     it isn't.
 *   - link target is `/products/${slug}`.
 *   - alt text on the primary image.
 *
 * Mock boundary: pure component, no mocks. Uses fixtures from
 * `tests/fixtures/products.ts` so we don't pin to placeholder array
 * indices.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ProductCard } from '@/components/product/ProductCard';
import {
  oneFeaturedProduct,
  outOfStockProduct,
  productWithoutRating,
  productWithoutSale,
} from '@/tests/fixtures/products';
import { formatPrice } from '@/lib/utils/format';

describe('ProductCard', () => {
  describe('renders', () => {
    it('shows the product name as an h3 inside a link to /products/{slug}', () => {
      const product = oneFeaturedProduct();

      render(<ProductCard product={product} />);

      const heading = screen.getByRole('heading', {
        level: 3,
        name: product.name,
      });
      expect(heading).toBeInTheDocument();
      const link = heading.closest('a');
      expect(link).toHaveAttribute('href', `/products/${product.slug}`);
    });

    it('renders the alt text on the primary image', () => {
      const product = oneFeaturedProduct();
      const expectedAlt =
        product.images.find((image) => image.isPrimary)?.alt ?? product.name;

      render(<ProductCard product={product} />);

      const image = screen.getByRole('img', { name: expectedAlt });
      expect(image).toBeInTheDocument();
    });

    it('renders the formatted price', () => {
      const product = oneFeaturedProduct();

      render(<ProductCard product={product} />);

      expect(
        screen.getByText(formatPrice(product.priceCents)),
      ).toBeInTheDocument();
    });
  });

  describe('Sale badge branch', () => {
    it('renders "Sale" badge and strike-through compare-at price when discounted', () => {
      const product = oneFeaturedProduct();
      expect(product.compareAtPriceCents).toBeDefined();

      render(<ProductCard product={product} />);

      expect(screen.getByText('Sale')).toBeInTheDocument();
      expect(
        screen.getByText(formatPrice(product.compareAtPriceCents as number)),
      ).toBeInTheDocument();
    });

    it('does NOT render the Sale badge when compareAtPriceCents is absent', () => {
      const product = productWithoutSale();

      render(<ProductCard product={product} />);

      expect(screen.queryByText('Sale')).not.toBeInTheDocument();
    });
  });

  describe('Out-of-stock branch', () => {
    it('renders the "Out of stock" badge and suppresses the Sale badge', () => {
      const product = outOfStockProduct();

      render(<ProductCard product={product} />);

      expect(screen.getByText('Out of stock')).toBeInTheDocument();
      expect(screen.queryByText('Sale')).not.toBeInTheDocument();
    });
  });

  describe('Rating chip branch', () => {
    it('renders rating avg + count when present', () => {
      const product = oneFeaturedProduct();
      expect(product.rating).toBeDefined();

      render(<ProductCard product={product} />);

      const expectedAvg = product.rating!.avg.toFixed(1);
      const expectedCount = `(${product.rating!.count})`;
      expect(screen.getByText(expectedAvg)).toBeInTheDocument();
      expect(screen.getByText(expectedCount)).toBeInTheDocument();
    });

    it('omits the rating chip when rating is undefined', () => {
      const product = productWithoutRating();

      const { container } = render(<ProductCard product={product} />);

      // The avg-formatted "X.X" text only appears in the rating chip;
      // assert no element matches a 1-decimal numeric text node.
      const ratingTexts = within(container).queryAllByText(/^\d\.\d$/);
      expect(ratingTexts).toHaveLength(0);
    });
  });

  describe('image fallback', () => {
    it('falls back to the product name as alt text when no image entry has an alt', () => {
      const product = oneFeaturedProduct();
      // Wipe alts so the fallback chooses the product name.
      product.images = product.images.map((image) => ({ ...image, alt: '' }));

      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('img', { name: product.name }),
      ).toBeInTheDocument();
    });

    it('renders the placeholder image alt when the product has no images at all', () => {
      const product = oneFeaturedProduct();
      product.images = [];

      render(<ProductCard product={product} />);

      expect(
        screen.getByRole('img', { name: product.name }),
      ).toBeInTheDocument();
    });
  });
});
