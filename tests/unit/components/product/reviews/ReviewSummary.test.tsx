import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewSummary } from '@/components/product/reviews/ReviewSummary';
import {
  emptyReviewListResponse,
  sampleReviewListResponse,
} from '@/tests/fixtures/reviews';

describe('ReviewSummary', () => {
  it('prefers API summary stats when provided', () => {
    const summary = sampleReviewListResponse().summary!;
    render(<ReviewSummary summary={summary} listTotal={summary.count} />);
    expect(screen.getByText(summary.avg.toFixed(1))).toBeInTheDocument();
    expect(screen.getByText(/Based on 127 reviews/)).toBeInTheDocument();
    expect(screen.getByText('5 stars')).toBeInTheDocument();
  });

  it('falls back to product aggregate rating when summary absent', () => {
    render(
      <ReviewSummary productRating={{ avg: 4.2, count: 9 }} listTotal={0} />,
    );
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText(/Based on 9 reviews/)).toBeInTheDocument();
  });

  it('shows empty-state copy when nothing is known', () => {
    const empty = emptyReviewListResponse();
    render(<ReviewSummary listTotal={empty.total} />);
    expect(screen.getByText(/No ratings yet/)).toBeInTheDocument();
  });
});
