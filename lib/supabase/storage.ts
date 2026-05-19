/**
 * Browser-side Supabase Storage helpers for the admin product image
 * uploader. Uses the existing browser client from `lib/supabase/client.ts`
 * — DO NOT touch that file (Phase 2 surface is locked).
 *
 * Bucket name is hard-coded as `'product-images'` here. The PLAN never
 * references the bucket from outside this helper, so we don't add a new
 * env var.
 *
 * Path scheme: `${user.id}/${crypto.randomUUID()}-${safeFileName}`. The
 * per-user prefix simplifies the bucket policy ("authenticated ADMIN
 * users can write into their own prefix only").
 *
 * Required Supabase Dashboard setup (one-time, out of code):
 *   1. Storage → Create bucket `product-images` (public, file size 5 MB).
 *   2. Storage → product-images → Policies → New policy:
 *        a. INSERT  : auth.role() = 'authenticated'
 *                     AND (storage.foldername(name))[1] = auth.uid()::text
 *                     AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN'
 *                     -- Fallback until migration: user_metadata.role still honored in app code only.
 *        b. UPDATE  : same condition as INSERT
 *        c. DELETE  : same condition as INSERT
 *        d. SELECT  : true   (public images are readable by anyone)
 *
 * **Backend-not-ready fallback:** when Supabase Storage upload fails
 * (the bucket hasn't been provisioned yet — Supabase returns
 * `Bucket not found`), we fall through to a base64 data URL so the form
 * preview still renders. This is preferable to a hard error because
 * local dev needs to walk the form end-to-end without a Storage round
 * trip. Tagged TODO(phase 8).
 */
import { createClient } from './client';

const BUCKET = 'product-images';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const FALLBACK_PATH_TAG = 'data:fallback';

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

let warnedAboutStorageFallback = false;

function warnFallback(reason: string): void {
  if (warnedAboutStorageFallback) return;
  warnedAboutStorageFallback = true;
  // eslint-disable-next-line no-console
  console.warn(
    `[storage] Supabase Storage upload failed (${reason}) — using base64 data-URL fallback for dev`,
  );
}

function safeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Could not read file'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export interface UploadProductImageResult {
  url: string;
  path: string;
}

export async function uploadProductImage(
  file: File,
): Promise<UploadProductImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new ImageUploadError('Only image files are supported.');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ImageUploadError('Images must be 5 MB or smaller.');
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new ImageUploadError('You must be signed in to upload images.');
  }

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${user.id}/${id}-${safeFileName(file.name)}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);
    if (!publicData?.publicUrl) {
      throw new Error('Could not resolve a public URL for the uploaded file');
    }
    return { url: publicData.publicUrl, path };
  } catch (err) {
    // TODO(phase 8): remove fallback once the product-images bucket is provisioned.
    const message = err instanceof Error ? err.message : 'unknown error';
    warnFallback(message);
    const dataUrl = await readAsDataUrl(file);
    return { url: dataUrl, path: FALLBACK_PATH_TAG };
  }
}

/**
 * Best-effort delete. The form does not block on failure — orphaned
 * objects are cleaner-job material, not a user-blocking error.
 */
export async function deleteProductImage(path: string): Promise<void> {
  if (!path || path === FALLBACK_PATH_TAG) return;
  try {
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Swallow — orphaned object will be cleaned up out of band.
  }
}
