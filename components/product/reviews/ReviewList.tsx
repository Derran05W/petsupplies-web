'use client';

import type { Review } from '@/types/review';
import { useAuth } from '@/hooks/useAuth';
import { ReviewCard } from './ReviewCard';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  const { user } = useAuth();
  const viewerUserId = user?.id;

  return (
    <ul className="flex flex-col border-b border-line">
      {reviews.map((review) => (
        <li key={review.id}>
          <ReviewCard
            review={review}
            isOwnReview={!!viewerUserId && review.userId === viewerUserId}
          />
        </li>
      ))}
    </ul>
  );
}
