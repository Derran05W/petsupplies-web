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

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init?.headers,
      },
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

  return (await response.json()) as T;
}
