'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

/**
 * next/image that swaps to `fallback` when the source fails to load
 * (missing public asset, deleted upload, optimizer-rejected format) —
 * admin-managed image URLs can dangle, and a browser broken-image glyph
 * on a tonal tile reads as a bug.
 */
export function PreviewImage({
  fallback,
  alt,
  ...props
}: ImageProps & { fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <Image {...props} alt={alt} onError={() => setFailed(true)} />;
}
