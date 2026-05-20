/**
 * AI description streaming client.
 */
import type { Category, PetType } from '@/types/product';
import type { AdminProductCategory } from '@/types/admin-product-api';
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

/** Map Phase 26 admin categories to the legacy AI prompt shape. */
export function aiPromptFromAdminCategory(category: AdminProductCategory): {
  category: Category;
  petType: PetType;
} {
  switch (category) {
    case 'CAT':
      return { category: 'food', petType: 'cat' };
    case 'BIRD':
      return { category: 'accessories', petType: 'bird' };
    case 'SMALL_PET':
      return { category: 'food', petType: 'small-animal' };
    case 'FISH':
      return { category: 'food', petType: 'small-animal' };
    case 'REPTILE':
      return { category: 'healthcare', petType: 'small-animal' };
    case 'ACCESSORIES':
      return { category: 'accessories', petType: 'dog' };
    case 'HEALTH':
      return { category: 'healthcare', petType: 'dog' };
    case 'DOG':
    default:
      return { category: 'food', petType: 'dog' };
  }
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

export async function generateDescriptionStreamForAdminCategory(
  name: string,
  category: AdminProductCategory,
  accessToken: string | undefined,
  options: StreamOptions,
): Promise<void> {
  const mapped = aiPromptFromAdminCategory(category);
  return generateDescriptionStream({ name, ...mapped }, accessToken, options);
}
