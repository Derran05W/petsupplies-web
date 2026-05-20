import { apiFetch } from '@/lib/api/client';
import type { StaticPageAdmin, StaticPageSlug } from '@/types/site';

export interface AdminSitePagesOptions {
  accessToken?: string;
}

function fetchOpts(accessToken?: string) {
  return accessToken
    ? { cache: 'no-store' as const, accessToken }
    : { cache: 'no-store' as const };
}

export async function adminListSitePages(
  options: AdminSitePagesOptions = {},
): Promise<{ pages: StaticPageAdmin[] }> {
  const { accessToken } = options;
  return apiFetch<{ pages: StaticPageAdmin[] }>(
    '/admin/site/pages',
    fetchOpts(accessToken),
  );
}

export type StaticPageUpsertInput = {
  title: string;
  bodyMarkdown: string;
  isPublished: boolean;
};

export async function adminUpsertSitePage(
  slug: StaticPageSlug,
  body: StaticPageUpsertInput,
  options: AdminSitePagesOptions = {},
): Promise<StaticPageAdmin> {
  const { accessToken } = options;
  return apiFetch<StaticPageAdmin>(`/admin/site/pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...fetchOpts(accessToken),
  });
}
