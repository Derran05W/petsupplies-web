import type { ApiProductImageUploadUrlResponse } from '@/types/admin-product-api';
import { apiFetch } from '../client';
import { uploadToPresignedUrl } from './product-images';
import type { AdminApiOptions } from './products';

function contentTypeForFile(file: File): string {
  if (
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/webp' ||
    file.type === 'image/gif'
  ) {
    return file.type;
  }
  if (file.name.toLowerCase().endsWith('.png')) return 'image/png';
  if (file.name.toLowerCase().endsWith('.webp')) return 'image/webp';
  if (file.name.toLowerCase().endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export async function adminGetSiteAssetUploadUrl(
  file: File,
  options: AdminApiOptions = {},
): Promise<ApiProductImageUploadUrlResponse> {
  const { accessToken } = options;
  return apiFetch<ApiProductImageUploadUrlResponse>(
    '/admin/site/assets/upload-url',
    {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        contentType: contentTypeForFile(file),
      }),
      cache: 'no-store',
      ...(accessToken ? { accessToken } : {}),
    },
  );
}

/** Upload a site asset and return its public URL. */
export async function uploadSiteAssetFile(
  file: File,
  options: AdminApiOptions = {},
): Promise<string> {
  const contentType = contentTypeForFile(file);
  const presign = await adminGetSiteAssetUploadUrl(file, options);
  if (file.size > presign.maxBytes) {
    throw new Error(
      `Image must be ${Math.round(presign.maxBytes / (1024 * 1024))} MB or smaller.`,
    );
  }
  await uploadToPresignedUrl(presign.uploadUrl, file, contentType);
  return presign.publicUrl;
}
