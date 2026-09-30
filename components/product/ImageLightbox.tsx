'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { type ProductImage } from '@/types/product';
import { cn } from '@/lib/utils';
import { DrawerPortal } from '@/components/layout/DrawerPortal';

interface ImageLightboxProps {
  images: ProductImage[];
  /** Image to open on; falls back to the primary/first image. */
  initialId?: string;
  open: boolean;
  onClose: () => void;
}

/** CSS scale applied while zoomed. */
const ZOOM_SCALE = 2;
/** Minimum horizontal travel (px) to register a navigation swipe. */
const SWIPE_THRESHOLD = 50;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Fullscreen image carousel with pinchless click-to-zoom + pan. Portalled
 * to `document.body` (see `DrawerPortal`) so the scrim covers the navbar
 * stack. A11y mirrors `<ConfirmDialog />`: `role="dialog"`,
 * `aria-modal`, focus-trap cycling inside `dialogRef`, focus-return via
 * `previouslyFocused`, body scroll-lock, and Escape to dismiss.
 *
 * Interaction model:
 *   - ArrowLeft / ArrowRight (and the on-screen controls) step through
 *     images and wrap around.
 *   - Clicking/tapping the image (or the zoom button) toggles ~2x zoom;
 *     while zoomed, moving the pointer pans the image (clamped to edges).
 *   - Touch swipe left/right navigates when not zoomed.
 *   - Escape unzooms first if zoomed, otherwise closes.
 *
 * Dependency-free — no carousel/lightbox package, boutique tokens only.
 */
export function ImageLightbox({
  images,
  initialId,
  open,
  onClose,
}: ImageLightboxProps) {
  // Primary-first, matching `<ImageGallery />` so indices line up with the
  // thumbnail strip the user clicked from.
  const ordered = useMemo(() => {
    if (images.length === 0) return [];
    const primary = images.find((image) => image.isPrimary);
    if (!primary) return images;
    return [primary, ...images.filter((image) => image.id !== primary.id)];
  }, [images]);

  const count = ordered.length;

  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [entered, setEntered] = useState(false);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const resetZoom = useCallback(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (dir: number) => {
      resetZoom();
      setIndex((current) =>
        count === 0 ? 0 : (current + dir + count) % count,
      );
    },
    [count, resetZoom],
  );

  // Land on the clicked-from image whenever the lightbox opens.
  useEffect(() => {
    if (!open) return;
    const start = ordered.findIndex((image) => image.id === initialId);
    setIndex(start >= 0 ? start : 0);
    resetZoom();
  }, [open, initialId, ordered, resetZoom]);

  // Enter transition (fade + scale). Kept as a class toggle so a closed
  // lightbox renders nothing (see the null guard below).
  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Scroll-lock + focus-return, mirroring ConfirmDialog.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (zoomed) {
          resetZoom();
        } else {
          onClose();
        }
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const activeEl = document.activeElement;

      if (event.shiftKey && activeEl === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, zoomed, onClose, go, resetZoom]);

  const handlePointerMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!zoomed) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const maxX = (rect.width * (ZOOM_SCALE - 1)) / 2;
      const maxY = (rect.height * (ZOOM_SCALE - 1)) / 2;
      setPan({
        x: clamp((0.5 - px) * rect.width * (ZOOM_SCALE - 1), -maxX, maxX),
        y: clamp((0.5 - py) * rect.height * (ZOOM_SCALE - 1), -maxY, maxY),
      });
    },
    [zoomed],
  );

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (touchStartX.current === null || zoomed) {
        touchStartX.current = null;
        return;
      }
      const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
      const dx = endX - touchStartX.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        go(dx < 0 ? 1 : -1);
      }
      touchStartX.current = null;
    },
    [zoomed, go],
  );

  const toggleZoom = useCallback(() => {
    setZoomed((z) => {
      if (z) setPan({ x: 0, y: 0 });
      return !z;
    });
  }, []);

  if (!open || count === 0) return null;

  const active = ordered[index] ?? ordered[0];
  const imageLabel = active?.alt || `Image ${index + 1} of ${count}`;
  const controlClasses =
    'inline-flex items-center justify-center rounded-pill border border-line bg-paper text-ink shadow-lifted transition-colors duration-base ease-soft hover:border-pine hover:bg-pine hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine';

  return (
    <DrawerPortal>
      <div className="fixed inset-0 z-[110]">
        <div
          role="presentation"
          onClick={onClose}
          className={cn(
            'absolute inset-0 bg-scrim transition-opacity duration-base ease-soft',
            entered ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={imageLabel}
          className={cn(
            'absolute inset-0 flex flex-col transition-all duration-base ease-soft motion-reduce:transition-none',
            entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          {/* Top bar: counter + zoom + close */}
          <div className="flex items-center justify-between gap-3 p-4">
            <span
              className="font-body text-micro text-paper"
              aria-live="polite"
            >
              {index + 1} / {count}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleZoom}
                aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
                aria-pressed={zoomed}
                className={cn(controlClasses, 'size-11')}
              >
                {zoomed ? (
                  <ZoomOut size={18} aria-hidden />
                ) : (
                  <ZoomIn size={18} aria-hidden />
                )}
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close image viewer"
                // Portal mounts a frame after `open` flips (DrawerPortal's
                // mounted gate), so the focus effect can miss the ref;
                // autoFocus lands focus when the button actually mounts.
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className={cn(controlClasses, 'size-11')}
              >
                <X size={18} aria-hidden />
              </button>
            </div>
          </div>

          {/* Stage */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
            {count > 1 ? (
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className={cn(
                  controlClasses,
                  'absolute left-4 top-1/2 z-[1] size-12 -translate-y-1/2',
                )}
              >
                <ChevronLeft size={22} aria-hidden />
              </button>
            ) : null}

            <div
              className="relative flex max-h-full max-w-full items-center justify-center overflow-hidden"
              onMouseMove={handlePointerMove}
              onMouseLeave={() => zoomed && setPan({ x: 0, y: 0 })}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={toggleZoom}
                aria-label={
                  zoomed
                    ? `Zoom out of ${imageLabel}`
                    : `Zoom into ${imageLabel}`
                }
                className={cn(
                  'relative block h-[70vh] w-[86vw] max-w-4xl',
                  zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
                )}
              >
                {active ? (
                  <Image
                    key={active.id}
                    src={active.url}
                    alt={active.alt || imageLabel}
                    fill
                    sizes="86vw"
                    priority
                    className="object-contain transition-transform duration-base ease-soft motion-reduce:transition-none"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${
                        zoomed ? ZOOM_SCALE : 1
                      })`,
                    }}
                  />
                ) : null}
              </button>
            </div>

            {count > 1 ? (
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className={cn(
                  controlClasses,
                  'absolute right-4 top-1/2 z-[1] size-12 -translate-y-1/2',
                )}
              >
                <ChevronRight size={22} aria-hidden />
              </button>
            ) : null}
          </div>

          {/* Thumbnail strip */}
          {count > 1 ? (
            <ul
              role="list"
              className="flex shrink-0 items-center justify-center gap-2 overflow-x-auto p-4"
            >
              {ordered.map((image, idx) => {
                const selected = idx === index;
                return (
                  <li key={image.id}>
                    <button
                      type="button"
                      onClick={() => {
                        resetZoom();
                        setIndex(idx);
                      }}
                      aria-label={`View image ${idx + 1} of ${count}`}
                      aria-current={selected}
                      className={cn(
                        'relative size-14 shrink-0 overflow-hidden rounded-tile border transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
                        selected
                          ? 'border-paper opacity-100'
                          : 'border-line opacity-60 hover:opacity-100',
                      )}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </DrawerPortal>
  );
}
