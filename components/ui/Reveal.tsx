'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms — mirrors the mockup's per-card `transition-delay`. */
  delay?: number;
}

/**
 * Scroll-reveal wrapper — the mockup's `.reveal` / `.reveal.in` pattern:
 * content starts at opacity 0 / translateY(30px) and eases in over 850ms
 * once 15% of it enters the viewport (IntersectionObserver, one-shot).
 * `motion-reduce` renders content visible with no transition.
 *
 * The pre-reveal hidden state is only ever applied client-side, and only
 * to content that starts below the fold — so SSR / no-JS output and any
 * already-visible content render fully visible (never permanently hidden).
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    // Content already in view on mount reveals immediately with no hidden
    // flash and no scroll dependency; only below-fold content is armed.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      return;
    }
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = armed && !inView;

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-reveal ease-soft',
        hidden ? 'translate-y-[30px] opacity-0' : 'translate-y-0 opacity-100',
        'motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
