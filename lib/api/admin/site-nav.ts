import type {
  CategoryStripItem,
  CategoryStripItemInput,
  FooterColumn,
  NavLink,
} from '@/types/site';
import { apiFetch } from '@/lib/api/client';
import type { SiteNavPublic } from '@/lib/site/nav-fallbacks';
import type { AdminApiOptions } from './products';

export async function replaceHeaderNav(
  links: NavLink[],
  options: AdminApiOptions = {},
): Promise<SiteNavPublic> {
  const { accessToken } = options;
  return apiFetch<SiteNavPublic>('/admin/site/nav/header', {
    method: 'PUT',
    body: JSON.stringify(links),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}

export async function replaceFooterNav(
  columns: FooterColumn[],
  options: AdminApiOptions = {},
): Promise<SiteNavPublic> {
  const { accessToken } = options;
  return apiFetch<SiteNavPublic>('/admin/site/nav/footer', {
    method: 'PUT',
    body: JSON.stringify(columns),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}

export async function replaceCategoryStrip(
  items: CategoryStripItemInput[],
  options: AdminApiOptions = {},
): Promise<CategoryStripItem[]> {
  const { accessToken } = options;
  return apiFetch<CategoryStripItem[]>('/admin/site/category-strip', {
    method: 'PUT',
    body: JSON.stringify(items),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
