import type { ProductImage } from '@/types/product';
import type {
  ApiAdminAddImageBody,
  ApiAdminProductImage,
  ApiAdminUpdateImageBody,
  ApiProductImageUploadUrlResponse,
} from '@/types/admin-product-api';
import { apiFetch } from '../client';
import { mapApiImage, isPersistedImageId } from './product-mapper';
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

export async function adminGetProductImageUploadUrl(
  file: File,
  options: AdminApiOptions = {},
): Promise<ApiProductImageUploadUrlResponse> {
  const { accessToken } = options;
  return apiFetch<ApiProductImageUploadUrlResponse>(
    '/admin/products/images/upload-url',
    {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        contentType: contentTypeForFile(file),
      }),
      ...(accessToken ? { accessToken } : {}),
    },
  );
}

/** Upload bytes to the presigned URL returned by the admin API. */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });
  if (!response.ok) {
    throw new Error(`Image upload failed (${response.status})`);
  }
}

export async function adminAddProductImage(
  productId: string,
  body: ApiAdminAddImageBody,
  options: AdminApiOptions = {},
): Promise<ProductImage> {
  const { accessToken } = options;
  const image = await apiFetch<ApiAdminProductImage>(
    `/admin/products/${encodeURIComponent(productId)}/images`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      ...(accessToken ? { accessToken } : {}),
    },
  );
  return mapApiImage(image);
}

export async function adminUpdateProductImage(
  productId: string,
  imageId: string,
  body: ApiAdminUpdateImageBody,
  options: AdminApiOptions = {},
): Promise<ProductImage> {
  const { accessToken } = options;
  const image = await apiFetch<ApiAdminProductImage>(
    `/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...(accessToken ? { accessToken } : {}),
    },
  );
  return mapApiImage(image);
}

export async function adminDeleteProductImage(
  productId: string,
  imageId: string,
  options: AdminApiOptions = {},
): Promise<void> {
  const { accessToken } = options;
  await apiFetch<void>(
    `/admin/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
    {
      method: 'DELETE',
      ...(accessToken ? { accessToken } : {}),
    },
  );
}

export async function adminReorderProductImages(
  productId: string,
  items: Array<{ id: string; sortOrder: number }>,
  options: AdminApiOptions = {},
): Promise<void> {
  const { accessToken } = options;
  await apiFetch<{ ok: boolean }>(
    `/admin/products/${encodeURIComponent(productId)}/images/reorder`,
    {
      method: 'PATCH',
      body: JSON.stringify({ items }),
      ...(accessToken ? { accessToken } : {}),
    },
  );
}

/**
 * After PATCH product scalars, reconcile gallery rows with the form state.
 */
export async function syncProductImages(
  productId: string,
  desired: ProductImage[],
  existing: ProductImage[],
  options: AdminApiOptions = {},
): Promise<ProductImage[]> {
  const existingPersisted = existing.filter((img) =>
    isPersistedImageId(img.id),
  );
  const desiredIds = new Set(
    desired.filter((img) => isPersistedImageId(img.id)).map((img) => img.id),
  );

  for (const img of existingPersisted) {
    if (!desiredIds.has(img.id)) {
      await adminDeleteProductImage(productId, img.id, options);
    }
  }

  const next: ProductImage[] = [];

  for (let index = 0; index < desired.length; index++) {
    const img = desired[index]!;
    const isPrimary = index === 0;
    const sortOrder = index;

    if (isPersistedImageId(img.id)) {
      const updated = await adminUpdateProductImage(
        productId,
        img.id,
        {
          altText: img.alt,
          sortOrder,
          isPrimary,
        },
        options,
      );
      next.push(updated);
    } else {
      const created = await adminAddProductImage(
        productId,
        {
          url: img.url,
          altText: img.alt,
          sortOrder,
          isPrimary,
        },
        options,
      );
      next.push(created);
    }
  }

  if (next.length > 0) {
    await adminReorderProductImages(
      productId,
      next.map((img, sortOrder) => ({ id: img.id, sortOrder })),
      options,
    );
  }

  return next.map((img, index) => ({ ...img, isPrimary: index === 0 }));
}

export async function uploadAdminProductImageFile(
  file: File,
  options: AdminApiOptions & { productId?: string } = {},
): Promise<ProductImage> {
  const contentType = contentTypeForFile(file);
  const presign = await adminGetProductImageUploadUrl(file, options);
  if (file.size > presign.maxBytes) {
    throw new Error(
      `Image must be ${Math.round(presign.maxBytes / (1024 * 1024))} MB or smaller.`,
    );
  }
  await uploadToPresignedUrl(presign.uploadUrl, file, contentType);

  if (options.productId) {
    return adminAddProductImage(
      options.productId,
      {
        url: presign.publicUrl,
        altText: file.name.replace(/\.[^/.]+$/, ''),
        isPrimary: false,
      },
      options,
    );
  }

  return {
    id: `img_${crypto.randomUUID()}`,
    url: presign.publicUrl,
    alt: file.name.replace(/\.[^/.]+$/, ''),
    isPrimary: false,
  };
}
