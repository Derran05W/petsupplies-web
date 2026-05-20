/** Client + admin validation for nav / category strip hrefs. */
export function isValidSiteHref(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith('/')) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.startsWith('mailto:')) return true;
  if (trimmed.startsWith('#')) return true;
  return false;
}

export function siteHrefError(href: string): string | null {
  if (href.trim().length === 0) return 'Link URL is required.';
  if (!isValidSiteHref(href)) {
    return 'Use a relative path (/products), https:// URL, mailto:, or #anchor.';
  }
  return null;
}
