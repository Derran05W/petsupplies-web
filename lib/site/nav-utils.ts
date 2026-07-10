/**
 * Storefront links for pet types we no longer carry (fish, bird). The nav
 * is admin-managed, so stale entries can keep arriving from the API long
 * after the catalogue dropped them — filter them out before rendering.
 */
const UNSUPPORTED_NAV_HREF = /[?&](petType|category)=(fish|bird)s?(?=[&#]|$)/i;

export function isSupportedNavLink(href: string): boolean {
  return !UNSUPPORTED_NAV_HREF.test(href);
}

/** Whether a nav href matches the current pathname (ignores query string). */
export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  const hrefPath = href.split('?')[0] ?? href;
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

/** Re-number positions sequentially from array order. */
export function withSequentialPositions<T extends { position: number }>(
  items: T[],
): T[] {
  return items.map((item, index) => ({ ...item, position: index }));
}
