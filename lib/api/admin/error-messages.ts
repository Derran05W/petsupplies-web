import { ApiError } from '@/lib/api/client';
import { isBackendUnreachableError } from '@/lib/api/unreachable';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";
const API_HOST_ERROR_MESSAGE =
  "Couldn't reach the API at the configured URL. For local dev use NEXT_PUBLIC_API_URL=http://localhost:3001 and restart next dev.";
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please sign in again.';
const FORBIDDEN_ERROR_MESSAGE = 'You need admin access to perform this action.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const IMAGE_NETWORK_ERROR_MESSAGE =
  "Couldn't reach the image service. Check your connection or try again.";
const IMAGE_SESSION_ERROR_MESSAGE =
  'You need to sign in as an admin to upload images.';
const IMAGE_GENERIC_ERROR_MESSAGE =
  'Could not upload that image. Try a different file.';

export type AdminApiErrorContext = 'product' | 'image';

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
    if (isBackendUnreachableError(err)) {
      if (/application not found/i.test(err.message)) {
        return API_HOST_ERROR_MESSAGE;
      }
      return network;
    }
    if (err.status === 401) return session;
    if (err.status === 403) return FORBIDDEN_ERROR_MESSAGE;
    if (err.status === 400 && err.message.length > 0) return err.message;
    return err.message || generic;
  }

  if (err instanceof Error && err.message.length > 0) {
    return err.message;
  }

  return generic;
}

/** Product form save/delete errors. */
export function productFormErrorMessage(err: unknown): string {
  return adminApiErrorMessage(err, 'product');
}

/** ImageUploader drop/select errors. */
export function imageUploadErrorMessage(err: unknown): string {
  return adminApiErrorMessage(err, 'image');
}
