import { apiFetch } from '@/lib/api/client';
import type {
  AdminDiscount,
  AdminDiscountCreateInput,
  AdminDiscountListResponse,
  AdminDiscountUpdateInput,
} from '@/types/admin-discount';

export interface AdminDiscountListOptions {
  page?: number;
  limit?: number;
  active?: boolean;
  accessToken?: string;
}

export interface AdminApiOptions {
  accessToken?: string;
}

function fetchOpts(accessToken?: string) {
  return accessToken
    ? { cache: 'no-store' as const, accessToken }
    : { cache: 'no-store' as const };
}

export async function adminListDiscounts(
  options: AdminDiscountListOptions = {},
): Promise<AdminDiscountListResponse> {
  const { page = 1, limit = 20, active, accessToken } = options;
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (active !== undefined) {
    params.set('active', active ? 'true' : 'false');
  }
  const qs = params.toString();
  return apiFetch<AdminDiscountListResponse>(
    `/admin/discounts${qs ? `?${qs}` : ''}`,
    fetchOpts(accessToken),
  );
}

export async function adminCreateDiscount(
  body: AdminDiscountCreateInput,
  options: AdminApiOptions = {},
): Promise<AdminDiscount> {
  const { accessToken } = options;
  return apiFetch<AdminDiscount>('/admin/discounts', {
    method: 'POST',
    body: JSON.stringify(body),
    ...fetchOpts(accessToken),
  });
}

export async function adminUpdateDiscount(
  id: string,
  body: AdminDiscountUpdateInput,
  options: AdminApiOptions = {},
): Promise<AdminDiscount> {
  const { accessToken } = options;
  return apiFetch<AdminDiscount>(`/admin/discounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...fetchOpts(accessToken),
  });
}

export async function adminDeleteDiscount(
  id: string,
  options: AdminApiOptions = {},
): Promise<AdminDiscount> {
  const { accessToken } = options;
  return apiFetch<AdminDiscount>(`/admin/discounts/${id}`, {
    method: 'DELETE',
    ...fetchOpts(accessToken),
  });
}
