/**
 * Covers `<ImageLightbox />` from `components/product/ImageLightbox.tsx` —
 * the fullscreen zoomable carousel opened from `<ImageGallery />`.
 *
 * What's covered:
 *   - opens on the `initialId` image (dialog label + counter reflect it).
 *   - ArrowLeft / ArrowRight step through images and wrap around.
 *   - Escape unzooms first when zoomed, then closes on the next press.
 *   - focus returns to the trigger after close (a11y focus-return).
 *
 * `next/image` is left un-mocked (renders a real <img> in jsdom, same as
 * the ProductCard suite) so alt text stays queryable.
 */
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ImageLightbox } from '@/components/product/ImageLightbox';
import type { ProductImage } from '@/types/product';

const images: ProductImage[] = [
  { id: 'img-a', url: '/a.jpg', alt: 'Front of the bag', isPrimary: true },
  { id: 'img-b', url: '/b.jpg', alt: 'Back of the bag', isPrimary: false },
  { id: 'img-c', url: '/c.jpg', alt: 'Kibble close-up', isPrimary: false },
];

describe('product/ImageLightbox', () => {
  it('opens with the initial image active', () => {
    render(
      <ImageLightbox
        images={images}
        initialId="img-b"
        open
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Back of the bag',
    );
  });

  it('navigates with arrow keys and wraps around', async () => {
    const user = userEvent.setup();
    render(
      <ImageLightbox
        images={images}
        initialId="img-a"
        open
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Wrap backwards from the first image to the last.
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('3 / 3')).toBeInTheDocument();

    // Wrap forwards from the last image back to the first.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('unzooms on the first Escape, then closes on the second', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ImageLightbox
        images={images}
        initialId="img-a"
        open
        onClose={onClose}
      />,
    );

    // Zoom in by clicking the image.
    await user.click(screen.getByRole('button', { name: /zoom into/i }));
    expect(
      screen.getByRole('button', { name: /zoom out of/i }),
    ).toBeInTheDocument();

    // First Escape only unzooms.
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: /zoom into/i }),
    ).toBeInTheDocument();

    // Second Escape closes.
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('returns focus to the trigger after closing', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open viewer
          </button>
          <ImageLightbox
            images={images}
            open={open}
            onClose={() => setOpen(false)}
          />
        </>
      );
    }

    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Open viewer' });
    await user.click(trigger);

    // Close button takes focus on open.
    expect(
      screen.getByRole('button', { name: 'Close image viewer' }),
    ).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(trigger).toHaveFocus();
  });
});
