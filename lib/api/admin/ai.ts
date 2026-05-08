/**
 * AI description streaming client.
 *
 * Why a bare `fetch` here, not `apiFetch`: the shared wrapper consumes
 * `response.json()` / `response.text()` at the bottom, which buffers the
 * whole body. Streaming chunked text needs `response.body!.pipeThrough(
 * new TextDecoderStream())` followed by reader iteration — fundamentally
 * incompatible with `apiFetch`'s "return parsed body" return type.
 * Refactoring `apiFetch` to expose the raw `Response` would force every
 * existing caller to juggle a discriminated return type. So we duplicate
 * the base-URL read here (the helper below) and explicitly attach
 * `Authorization: Bearer ${accessToken}` ourselves.
 *
 * Backend Phase 8 contract:
 *   POST /admin/products/generate-description
 *   Body:    { name, category, petType, ingredients?, refinement? }
 *   Returns: text/plain streamed chunks (no JSON wrapper).
 *
 * **Backend-not-ready fallback:** if the request fails with a network
 * error (TypeError from `fetch`) OR a non-2xx response, we fall through
 * to `lib/admin/ai-fallback.ts` which yields chunks identically. Single
 * console.warn per session. TODO(phase 8).
 */
import type { Category, PetType } from '@/types/product';
import { streamFallbackDescription } from '@/lib/admin/ai-fallback';

interface GenerateDescriptionInput {
  name: string;
  category: Category;
  petType: PetType;
  ingredients?: string;
  refinement?: string;
}

interface StreamOptions {
  signal?: AbortSignal;
  /** Called once per decoded chunk; UI appends to the textarea. */
  onChunk: (chunk: string) => void;
}

function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url || url.length === 0) return 'http://localhost:3001';
  return url.replace(/\/$/, '');
}

let warnedAboutAiFallback = false;

function warnFallback(reason: string): void {
  if (warnedAboutAiFallback) return;
  warnedAboutAiFallback = true;
  // eslint-disable-next-line no-console
  console.warn(
    `[admin/ai] streaming endpoint unreachable (${reason}) — using local fallback for dev`,
  );
}

async function streamFromBackend(
  input: GenerateDescriptionInput,
  accessToken: string | undefined,
  signal: AbortSignal | undefined,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/plain',
  };
  if (accessToken && accessToken.length > 0) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${getApiBaseUrl()}/admin/products/generate-description`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      ...(signal ? { signal } : {}),
    },
  );

  if (!response.ok || !response.body) {
    throw new Error(
      `Streaming request failed: ${response.status} ${response.statusText}`,
    );
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      if (signal?.aborted) return;
      const { value, done } = await reader.read();
      if (done) return;
      if (value && value.length > 0) onChunk(value);
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // already closed
    }
  }
}

async function streamFromFallback(
  input: GenerateDescriptionInput,
  signal: AbortSignal | undefined,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const iterator = streamFallbackDescription({
    name: input.name,
    category: input.category,
    petType: input.petType,
    ...(input.refinement ? { refinement: input.refinement } : {}),
    ...(signal ? { signal } : {}),
  });
  for await (const chunk of iterator) {
    if (signal?.aborted) return;
    onChunk(chunk);
  }
}

export async function generateDescriptionStream(
  input: GenerateDescriptionInput,
  accessToken: string | undefined,
  options: StreamOptions,
): Promise<void> {
  const { signal, onChunk } = options;

  try {
    await streamFromBackend(input, accessToken, signal, onChunk);
    return;
  } catch (err) {
    if (signal?.aborted) return;
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    if (isAbort) return;
    const message = err instanceof Error ? err.message : 'unknown error';
    warnFallback(message);
    await streamFromFallback(input, signal, onChunk);
  }
}
