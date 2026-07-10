/**
 * Root not-found page — boutique 404 with a Fraunces headline, a PetIcon
 * tile, and a CTA back to the shop.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('NotFound', () => {
  it('renders the 404 headline and a link back to the shop', () => {
    render(<NotFound />);
    expect(
      screen.getByRole('heading', { level: 1, name: /walkies/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Error 404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to shop' })).toHaveAttribute(
      'href',
      '/products',
    );
  });
});
