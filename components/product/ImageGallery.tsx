'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { type ProductImage } from '@/types/product';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

interface ImageGalleryProps {
  productName: string;
  images: ProductImage[];
}

/**
 * Primary image + thumbnail strip. Click a thumbnail to swap the main
 * image. If `images` is empty, renders a single placeholder slot in the
 * brand colour so the layout never collapses.
 */
export function ImageGallery({ productName, images }: ImageGalleryProps) {
  const ordered = useMemo(() => {
    if (images.length === 0) return [];
    const primary = images.find((image) => image.isPrimary);
    if (!primary) return images;
    return [primary, ...images.filter((image) => image.id !== primary.id)];
  }, [images]);

  const [activeId, setActiveId] = useState<string | undefined>(ordered[0]?.id);

  const active = ordered.find((image) => image.id === activeId) ?? ordered[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-warm-100">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt || productName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        ) : (
          <Image
            src={FALLBACK_IMAGE}
            alt={productName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      {ordered.length > 1 ? (
        <ul className="flex gap-3" role="list">
          {ordered.map((image, idx) => {
            const selected = image.id === active?.id;
            return (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(image.id)}
                  aria-label={`${productName} – image ${idx + 1}`}
                  aria-pressed={selected}
                  className={cn(
                    'relative aspect-square size-20 overflow-hidden rounded-lg border-2 bg-warm-100 transition-colors',
                    selected
                      ? 'border-brand-400'
                      : 'border-warm-200 hover:border-warm-300',
                  )}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
