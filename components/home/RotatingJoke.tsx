'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const ROTATE_MS = 5000;
const FADE_MS = 400;

/**
 * The footer CTA's rotating one-liner (mockup `#joke`): fades out, swaps
 * text, fades back in every 5s. Decorative — hidden from assistive tech
 * so the churn never reaches screen readers.
 */
export function RotatingJoke({ jokes }: { jokes: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (jokes.length < 2) return;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimer.current = setTimeout(() => {
        setIndex((current) => (current + 1) % jokes.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      clearInterval(interval);
      if (fadeTimer.current !== null) clearTimeout(fadeTimer.current);
    };
  }, [jokes.length]);

  if (jokes.length === 0) return null;

  return (
    <p
      aria-hidden
      className={cn(
        'mt-12 min-h-[1.5em] font-body text-[0.8rem] italic text-ink-faint transition-opacity duration-[400ms]',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {jokes[index]}
    </p>
  );
}
