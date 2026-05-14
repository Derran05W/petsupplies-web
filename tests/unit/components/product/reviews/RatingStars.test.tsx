import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingStars } from '@/components/product/reviews/RatingStars';

describe('RatingStars', () => {
  it('aggregate variant renders one filled star', () => {
    render(<RatingStars variant="aggregate" value={4.2} size={12} />);
    expect(screen.getByText(/Rated 4\.2 out of 5 stars/)).toBeInTheDocument();
  });

  it('aggregate variant skips sr-only when announce is false', () => {
    render(
      <RatingStars variant="aggregate" value={4} size={12} announce={false} />,
    );
    expect(screen.queryByText(/Rated/)).not.toBeInTheDocument();
  });

  it('full variant exposes aria-label with rounded stars', () => {
    render(<RatingStars variant="full" value={4} size={14} />);
    expect(
      screen.getByRole('img', { name: 'Rated 4 out of 5 stars' }),
    ).toBeInTheDocument();
  });
});
