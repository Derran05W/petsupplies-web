'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { type ProductImage } from '@/types/product';
import { cn } from '@/lib/utils';
import { PetIcon } from '@/components/ui';
import { TONE_CLASSES } from '@/components/ui/tones';

interface ImageGalleryProps {
  productName: string;
  images: ProductImage[];
}

/**
 * Primary image + thumbnail strip. Click a thumbnail to swap the main
 * image. Tiles sit on a tonal gradient (mirrors the boutique
 * `ProductCard`); if `images` is empty, a line-art paw on the gradient
 * keeps the layout from collapsing.
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
      <div
        className={cn(
          'group relative flex aspect-square items-center justify-center overflow-hidden rounded-tile',
          TONE_CLASSES.amber,
        )}
        {...(active ? {} : { role: 'img', 'aria-label': productName })}
      >
        {active ? (
          <Image
            src={active.url}
            alt={active.alt || productName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover transition-transform duration-slow ease-soft group-hover:scale-[1.06] motion-reduce:transform-none"
          />
        ) : (
          <PetIcon
            name="paw"
            className="h-[44%] w-[44%] transition-transform duration-slow ease-soft group-hover:-rotate-3 group-hover:scale-110 motion-reduce:transform-none"
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
                    'relative aspect-square size-20 overflow-hidden rounded-tile border transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
                    TONE_CLASSES.amber,
                    selected ? 'border-ink' : 'border-line hover:border-ink',
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
