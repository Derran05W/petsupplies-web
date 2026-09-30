/**
 * Covers `<ImageGallery />` from `components/product/ImageGallery.tsx` —
 * specifically the lightbox wiring: clicking the main image tile opens the
 * fullscreen `<ImageLightbox />` at the active image, and closing it
 * returns focus to the tile.
 *
 * `next/image` is left un-mocked (renders a real <img> in jsdom).
 */
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ImageGallery } from '@/components/product/ImageGallery';
import type { ProductImage } from '@/types/product';

const images: ProductImage[] = [
  { id: 'img-a', url: '/a.jpg', alt: 'Front of the bag', isPrimary: true },
  { id: 'img-b', url: '/b.jpg', alt: 'Back of the bag', isPrimary: false },
];

describe('product/ImageGallery', () => {
  it('opens the lightbox when the main image is clicked', async () => {
    const user = userEvent.setup();
    render(<ImageGallery productName="Salmon Kibble" images={images} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /view full size/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // Opens on the primary/active image.
    expect(dialog).toHaveAttribute('aria-label', 'Front of the bag');
  });

  it('returns focus to the tile after the lightbox closes', async () => {
    const user = userEvent.setup();
    render(<ImageGallery productName="Salmon Kibble" images={images} />);

    const tile = screen.getByRole('button', { name: /view full size/i });
    await user.click(tile);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(tile).toHaveFocus();
  });

  it('renders the paw fallback (no tile button) when there are no images', () => {
    render(<ImageGallery productName="Salmon Kibble" images={[]} />);

    expect(
      screen.queryByRole('button', { name: /view full size/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Salmon Kibble' }),
    ).toBeInTheDocument();
  });
});
