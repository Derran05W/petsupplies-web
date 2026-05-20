'use client';

import { useEffect, useState } from 'react';

/** Wait before showing navigation feedback (avoids flash on fast route changes). */
export const NAVIGATION_FEEDBACK_DELAY_MS = 800;

/**
 * Returns true only after `pending` stays true for `delayMs`. Resets
 * immediately when `pending` becomes false.
 */
export function useDelayedPending(
  pending: boolean,
  delayMs = NAVIGATION_FEEDBACK_DELAY_MS,
): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!pending) {
      setShow(false);
      return;
    }
    const id = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(id);
  }, [pending, delayMs]);

  return show;
}
