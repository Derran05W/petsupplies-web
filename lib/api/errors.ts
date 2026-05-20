/**
 * Normalize petsupplies-api error bodies into a single user-facing string.
 *
 * Hono + @hono/zod-validator returns:
 * `{ success: false, error: { message: "<json Zod issues>" } }`
 * The global error handler returns `{ error: "..." }`.
 */
export function parseApiErrorMessage(
  body: unknown,
  fallback = 'Request failed',
): string {
  if (!body || typeof body !== 'object') return fallback;

  const record = body as Record<string, unknown>;

  if (typeof record.message === 'string' && record.message.length > 0) {
    return formatZodIssuesMessage(record.message) ?? record.message;
  }

  if (typeof record.error === 'string' && record.error.length > 0) {
    return record.error;
  }

  if (record.error && typeof record.error === 'object') {
    const nested = record.error as Record<string, unknown>;
    if (typeof nested.message === 'string' && nested.message.length > 0) {
      return formatZodIssuesMessage(nested.message) ?? nested.message;
    }
  }

  return fallback;
}

function formatZodIssuesMessage(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('[')) return undefined;

  try {
    const issues = JSON.parse(trimmed) as Array<{
      message?: string;
      path?: unknown[];
    }>;
    const first = issues.find((issue) => typeof issue.message === 'string');
    if (!first?.message) return undefined;

    const path =
      Array.isArray(first.path) && first.path.length > 0
        ? first.path.map(String).join('.')
        : undefined;

    if (path) {
      return `${path}: ${first.message}`;
    }
    return first.message;
  } catch {
    return undefined;
  }
}
