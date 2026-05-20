import { apiFetch } from '@/lib/api/client';
import type { SiteSettingsPublic } from '@/types/site';

export type SiteSettingsPatch = Partial<SiteSettingsPublic>;

export interface AdminSiteSettingsOptions {
  accessToken?: string;
}

export async function patchSiteSettings(
  body: SiteSettingsPatch,
  options: AdminSiteSettingsOptions = {},
): Promise<SiteSettingsPublic> {
  const { accessToken } = options;
  return apiFetch<SiteSettingsPublic>('/admin/site/settings', {
    method: 'PATCH',
    body: JSON.stringify(body),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
