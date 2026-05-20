import { ApiError } from '@/lib/api/client';
import { isBackendUnreachableError } from '@/lib/api/unreachable';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";
const API_HOST_ERROR_MESSAGE =
  "Couldn't reach the API at the configured URL. For local dev use NEXT_PUBLIC_API_URL=http://localhost:3001 and restart next dev.";
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please sign in again.';
const FORBIDDEN_ERROR_MESSAGE = 'You need admin access to perform this action.';
const FORBIDDEN_DB_MISMATCH_MESSAGE =
  'Admin is configured in Supabase but the store database has not granted access yet. See docs/admin-access.md — sign out and sign in after your account is promoted.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const IMAGE_NETWORK_ERROR_MESSAGE =
  "Couldn't reach petsupplies-api to start the image upload. Run `pnpm dev` in petsupplies-api, restart `pnpm dev` in petsupplies-web (uses /api-backend proxy in local dev), and open the admin UI at http://localhost:3000.";
const IMAGE_SESSION_ERROR_MESSAGE =
  'You need to sign in as an admin to upload images.';
const IMAGE_GENERIC_ERROR_MESSAGE =
  'Could not upload that image. Try a different file.';

export type AdminApiErrorContext = 'product' | 'image';

function adminForbiddenMessage(err: ApiError): string {
  const { message } = err;

  if (process.env.NODE_ENV !== 'production') {
    if (message.length > 0 && message !== 'Forbidden') {
      return message;
    }
  }

  if (/sync_auth_user|no public\.User/i.test(message)) {
    return FORBIDDEN_DB_MISMATCH_MESSAGE;
  }

  if (message === 'Forbidden' || message.length === 0) {
    return FORBIDDEN_DB_MISMATCH_MESSAGE;
  }

  return FORBIDDEN_ERROR_MESSAGE;
}

/**
 * Map ApiError (and unknown throws) to stable admin UI copy.
 */
export function adminApiErrorMessage(
  err: unknown,
  context: AdminApiErrorContext = 'product',
): string {
  const network =
    context === 'image' ? IMAGE_NETWORK_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE;
  const session =
    context === 'image' ? IMAGE_SESSION_ERROR_MESSAGE : SESSION_ERROR_MESSAGE;
  const generic =
    context === 'image' ? IMAGE_GENERIC_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE;

  if (err instanceof ApiError) {
    if (err.status === 502 && context === 'image') {
      if (/does not exist|bucket not found|Storage bucket/i.test(err.message)) {
        return 'Supabase Storage bucket is missing. In the Supabase dashboard create a public bucket named product-images (or match SUPABASE_STORAGE_BUCKET in petsupplies-api .env). See petsupplies-api supabase/storage/product-images-bucket.sql.';
      }
      return err.message.length > 0
        ? err.message
        : 'Image storage is not configured on the API (check SUPABASE_STORAGE_BUCKET and bucket CORS in Supabase).';
    }
    if (isBackendUnreachableError(err)) {
      if (/application not found/i.test(err.message)) {
        return API_HOST_ERROR_MESSAGE;
      }
      return network;
    }
    if (err.status === 401) return session;
    if (err.status === 403) return adminForbiddenMessage(err);
    if (err.status === 400 && err.message.length > 0) return err.message;
    return err.message || generic;
  }

  if (err instanceof Error && err.message.length > 0) {
    return err.message;
  }

  return generic;
}

/** Streaming admin sections — prefer mapped API copy over raw status text. */
export function adminSectionErrorMessage(
  err: unknown,
  fallback: string,
): string {
  if (err instanceof ApiError) {
    return adminApiErrorMessage(err, 'product');
  }
  if (err instanceof Error && err.message.length > 0) {
    return err.message;
  }
  return fallback;
}

/** Product form save/delete errors. */
export function productFormErrorMessage(err: unknown): string {
  return adminApiErrorMessage(err, 'product');
}

/** ImageUploader drop/select errors. */
export function imageUploadErrorMessage(err: unknown): string {
  return adminApiErrorMessage(err, 'image');
}

/** @internal — tests */
export const adminErrorMessagesForTests = {
  FORBIDDEN_DB_MISMATCH_MESSAGE,
  SESSION_ERROR_MESSAGE,
};
