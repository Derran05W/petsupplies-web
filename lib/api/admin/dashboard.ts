import type { DashboardStats } from '@/types/admin';
import { apiFetch } from '../client';

export interface AdminApiOptions {
  accessToken?: string;
}

export async function getDashboardStats(
  options: AdminApiOptions = {},
): Promise<DashboardStats> {
  const { accessToken } = options;
  return apiFetch<DashboardStats>(
    '/admin/dashboard',
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
}
