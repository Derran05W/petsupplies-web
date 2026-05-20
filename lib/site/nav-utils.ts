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
