import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewCard } from '@/components/product/reviews/ReviewCard';
import {
  sampleUnverifiedReview,
  sampleVerifiedReview,
} from '@/tests/fixtures/reviews';

describe('ReviewCard', () => {
  it('renders verified badge, title, and body', () => {
    const review = sampleVerifiedReview();
    render(<ReviewCard review={review} />);
    expect(screen.getByText(review.displayName)).toBeInTheDocument();
    expect(screen.getByText(review.title!)).toBeInTheDocument();
    expect(screen.getByText(/Verified purchase/)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Rated 5 out of 5 stars' }),
    ).toBeInTheDocument();
  });

  it('omits badge and title branch for unverified reviews without title', () => {
    const review = sampleUnverifiedReview();
    render(<ReviewCard review={review} />);
    expect(screen.queryByText(/Verified purchase/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.getByText(review.body)).toBeInTheDocument();
  });
});
