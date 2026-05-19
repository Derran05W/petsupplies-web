/**
 * Validates `returnTo` query values so we only link to same-origin paths.
 * Rejects protocol-relative URLs and obvious open-redirect patterns.
 */
export function safeReturnPath(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw.trim());
  } catch {
    return null;
  }
  if (!decoded.startsWith('/')) return null;
  if (decoded.startsWith('//')) return null;
  if (decoded.includes('\\')) return null;
  const lower = decoded.toLowerCase();
  if (
    lower.startsWith('/javascript:') ||
    lower.includes('javascript:') ||
    lower.startsWith('/data:')
  ) {
    return null;
  }
  return decoded;
}
