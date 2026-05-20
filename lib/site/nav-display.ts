import type { FooterColumn } from '@/types/site';
import { FOOTER_NAV_FALLBACK } from '@/lib/site/nav-fallbacks';

export function resolveFooterColumns(columns: FooterColumn[]): FooterColumn[] {
  return columns.length > 0 ? columns : FOOTER_NAV_FALLBACK;
}
