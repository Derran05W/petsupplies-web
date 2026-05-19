import { safeReturnPath } from './safe-return-path';

/**
 * Appends `?returnTo=` or `&returnTo=` to an internal href, preserving `#hash`.
 */
export function appendReturnTo(
  targetHref: string,
  currentPathname: string,
): string {
  const safePath = safeReturnPath(currentPathname);
  if (!safePath) return targetHref;

  const [pathPart, ...hashParts] = targetHref.split('#');
  const hash = hashParts.length > 0 ? `#${hashParts.join('#')}` : '';
  const base = pathPart ?? targetHref;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}returnTo=${encodeURIComponent(safePath)}${hash}`;
}

/**
 * Merges `returnTo` onto account-area links when present in the current URL.
 */
export function preserveReturnOnAccountHref(
  linkHref: string,
  returnToRaw: string | null | undefined,
): string {
  const safe = safeReturnPath(returnToRaw);
  if (!safe) return linkHref;

  const [pathPart, ...hashParts] = linkHref.split('#');
  const hash = hashParts.length > 0 ? `#${hashParts.join('#')}` : '';
  const base = pathPart ?? linkHref;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}returnTo=${encodeURIComponent(safe)}${hash}`;
}
