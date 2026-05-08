'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, Loader2, Trash2, UploadCloud } from 'lucide-react';
import type { ProductImage } from '@/types/product';
import {
  deleteProductImage,
  ImageUploadError,
  uploadProductImage,
} from '@/lib/supabase/storage';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  /** True when the parent form is submitting — uploader disables. */
  disabled?: boolean;
}

interface InternalImage extends ProductImage {
  /** Set when this image was uploaded but the parent hasn't yet emitted
   * it back through `value` — used internally for upload-progress UI. */
  storagePath?: string;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function reorderPrimary(images: InternalImage[]): ProductImage[] {
  return images.map((image, index) => ({
    id: image.id,
    url: image.url,
    alt: image.alt,
    isPrimary: index === 0,
  }));
}

/**
 * Multi-image uploader. Owns no long-lived state besides per-file
 * upload progress; everything else lives in the parent form's
 * `value` / `onChange` props so the form schema can validate.
 *
 * Reorder via up/down arrow buttons (no drag-sort dep). The first
 * image is implicitly primary on emit. Alt text is editable inline
 * under each thumbnail and required for save.
 */
export function ImageUploader({
  value,
  onChange,
  disabled = false,
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

    const results: InternalImage[] = [];
    for (const file of list) {
      try {
        const { url, path } = await uploadProductImage(file);
        results.push({
          id: newId(),
          url,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isPrimary: false,
          storagePath: path,
        });
      } catch (err) {
        if (err instanceof ImageUploadError) setError(err.message);
        else setError('Could not upload that image. Try a different file.');
      } finally {
        setBusyCount((n) => Math.max(0, n - 1));
      }
    }

    if (results.length > 0) {
      const next = reorderPrimary([...value, ...results]);
      onChange(next);
    }
  };

  const handleRemove = (id: string) => {
    const target = value.find((image) => image.id === id) as
      | InternalImage
      | undefined;
    const next = reorderPrimary(value.filter((image) => image.id !== id));
    onChange(next);
    if (target?.storagePath) {
      void deleteProductImage(target.storagePath);
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
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition-colors',
          dragOver
            ? 'border-brand-400 bg-brand-50'
            : 'border-warm-300 hover:border-warm-400',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          aria-hidden
          className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          {busyCount > 0 ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <UploadCloud size={18} />
          )}
        </span>
        <p className="font-body text-sm font-medium text-warm-900">
          {busyCount > 0
            ? `Uploading ${busyCount} ${busyCount === 1 ? 'image' : 'images'}…`
            : 'Drag and drop images, or click to choose'}
        </p>
        <p id={helpId} className="font-body text-xs text-warm-600">
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
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-body text-xs text-red-700"
        >
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-col gap-2 rounded-xl border border-warm-200 bg-white p-2"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-warm-100">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 30vw, 50vw"
                  className="object-cover"
                  unoptimized={image.url.startsWith('data:')}
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.06em] text-brand-700">
                    Primary
                  </span>
                )}
              </div>
              <input
                type="text"
                value={image.alt}
                onChange={(event) => handleAlt(image.id, event.target.value)}
                placeholder="Alt text (required)"
                className="w-full rounded-md border border-warm-300 bg-white px-2 py-1 font-body text-xs text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(image.id, -1)}
                    disabled={index === 0 || disabled}
                    aria-label={`Move ${image.alt || 'image'} up`}
                    className="inline-flex size-7 items-center justify-center rounded-md border border-warm-300 bg-white text-warm-600 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp size={12} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(image.id, 1)}
                    disabled={index === value.length - 1 || disabled}
                    aria-label={`Move ${image.alt || 'image'} down`}
                    className="inline-flex size-7 items-center justify-center rounded-md border border-warm-300 bg-white text-warm-600 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown size={12} aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  disabled={disabled}
                  aria-label={`Remove ${image.alt || 'image'}`}
                  className="inline-flex size-7 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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
