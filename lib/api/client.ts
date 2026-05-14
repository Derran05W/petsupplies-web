/**
 * Typed fetch wrapper for petsupplies-api.
 *
 * Usage:
 *   const data = await apiFetch<MyType>('/some/path');
 *
 * Errors:
 *   - Non-2xx responses throw `ApiError` with the HTTP status and any
 *     validation errors the backend reported (Zod-style `errors` map).
 *   - Network failures (DNS, connection refused, offline) throw
 *     `ApiError` with `status: 0`. Callers can branch on this to fall
 *     back to placeholder data.
 */

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly validationErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    validationErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (validationErrors) {
      this.validationErrors = validationErrors;
    }
  }

  /** True when the request never reached the server (DNS / network / CORS). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || url.length === 0) {
    return 'http://localhost:3001';
  }
  return url.replace(/\/$/, '');
}

export interface ApiFetchInit extends RequestInit {
  /**
   * Supabase access token. When provided, attached as
   * `Authorization: Bearer <token>` so the backend can identify the
   * caller. Server-side callers read it via
   * `(await createClient()).auth.getSession()`; client-side callers
   * read it via the same browser client. NEVER persisted (no
   * localStorage / sessionStorage) — Supabase owns refresh.
   */
  accessToken?: string;
}

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchInit,
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const { accessToken, headers: initHeaders, ...restInit } = init ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(initHeaders as Record<string, string> | undefined),
  };
  if (accessToken && accessToken.length > 0) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...restInit,
      headers,
    });
  } catch (_err) {
    throw new ApiError('Network error: backend unreachable', 0);
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // response had no JSON body — fall through with empty body
    }
    throw new ApiError(
      body.message ?? response.statusText ?? 'Request failed',
      response.status,
      body.errors,
    );
  }

  // 204 No Content — return undefined coerced to T (callers should pick
  // `T = void` for these endpoints).
  if (response.status === 204) {
    return undefined as T;
  }

  // Guard against the backend URL accidentally resolving to a non-API
  // server (e.g. the Next.js dev server) that returns an HTML page with
  // a 200 status. Without this check, JSON.parse throws a SyntaxError
  // that is not an ApiError, so callers' network-error fallbacks never
  // fire and the error propagates uncaught.
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('Backend returned a non-JSON response', 0);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('Failed to parse backend response as JSON', 0);
  }
}
