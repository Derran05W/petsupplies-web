'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ProductImage } from '@/types/product';
import { imageUploadErrorMessage } from '@/lib/api/admin/error-messages';
import {
  adminDeleteProductImage,
  uploadAdminProductImageFile,
} from '@/lib/api/admin/product-images';
import { isPersistedImageId } from '@/lib/api/admin/product-mapper';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  disabled?: boolean;
  /** When editing, uploads attach via POST /admin/products/:id/images. */
  productId?: string | null;
}

function reorderPrimary(images: ProductImage[]): ProductImage[] {
  return images.map((image, index) => ({
    ...image,
    isPrimary: index === 0,
  }));
}

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function ImageUploader({
  value,
  onChange,
  disabled = false,
  productId = null,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busyCount, setBusyCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const helpId = useId();

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setError(null);
    setBusyCount((n) => n + list.length);

    const results: ProductImage[] = [];
    const accessToken = await getBrowserAccessToken();

    for (const file of list) {
      try {
        const image = await uploadAdminProductImageFile(file, {
          ...(accessToken ? { accessToken } : {}),
          ...(productId ? { productId } : {}),
        });
        results.push(image);
      } catch (err) {
        setError(imageUploadErrorMessage(err));
      } finally {
        setBusyCount((n) => Math.max(0, n - 1));
      }
    }

    if (results.length > 0) {
      onChange(reorderPrimary([...value, ...results]));
    }
  };

  const handleRemove = (id: string) => {
    const target = value.find((image) => image.id === id);
    const next = reorderPrimary(value.filter((image) => image.id !== id));
    onChange(next);

    if (productId && target && isPersistedImageId(target.id)) {
      void getBrowserAccessToken().then((accessToken) =>
        adminDeleteProductImage(productId, target.id, {
          ...(accessToken ? { accessToken } : {}),
        }),
      );
    }
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    const idx = value.findIndex((image) => image.id === id);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(idx, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    onChange(reorderPrimary(next));
  };

  const handleAlt = (id: string, alt: string) => {
    onChange(
      value.map((image) => (image.id === id ? { ...image, alt } : image)),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={helpId}
        aria-label="Drop images to upload, or press Enter to choose files"
        onClick={() => {
          if (disabled) return;
          inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer?.files) {
            void handleFiles(event.dataTransfer.files);
          }
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed bg-panel px-6 py-10 text-center transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
          dragOver ? 'border-pine' : 'border-line hover:border-ink',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          aria-hidden
          className="inline-flex size-10 items-center justify-center rounded-full bg-paper text-pine"
        >
          {busyCount > 0 ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <UploadCloud size={18} />
          )}
        </span>
        <p className="font-body text-sm font-medium text-ink-muted">
          {busyCount > 0
            ? `Uploading ${busyCount} ${busyCount === 1 ? 'image' : 'images'}…`
            : 'Drag and drop images, or click to choose'}
        </p>
        <p id={helpId} className="font-body text-xs text-ink-muted">
          PNG, JPG, or WebP up to 5 MB each.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-xs text-danger-solid"
        >
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-col gap-2 rounded-tile border border-line bg-paper p-2"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-tile bg-panel">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 30vw, 50vw"
                  className="object-cover"
                  unoptimized={image.url.startsWith('data:')}
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center rounded-tag bg-ink px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.06em] text-paper">
                    Primary
                  </span>
                )}
              </div>
              <input
                type="text"
                value={image.alt}
                onChange={(event) => handleAlt(image.id, event.target.value)}
                placeholder="Alt text (required)"
                className="w-full rounded-tile border border-line bg-paper px-2 py-1 font-body text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
              />
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(image.id, -1)}
                    disabled={index === 0 || disabled}
                    aria-label={`Move ${image.alt || 'image'} up`}
                    className="inline-flex size-7 items-center justify-center rounded-tile border border-line bg-paper text-ink-muted transition-colors duration-fast hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp size={12} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(image.id, 1)}
                    disabled={index === value.length - 1 || disabled}
                    aria-label={`Move ${image.alt || 'image'} down`}
                    className="inline-flex size-7 items-center justify-center rounded-tile border border-line bg-paper text-ink-muted transition-colors duration-fast hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown size={12} aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  disabled={disabled}
                  aria-label={`Remove ${image.alt || 'image'}`}
                  className="inline-flex size-7 items-center justify-center rounded-tile text-danger-solid transition-colors duration-fast hover:bg-danger-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={12} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
