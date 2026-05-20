/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveApiBaseUrl } from '@/lib/api/resolve-api-base-url';

describe('resolveApiBaseUrl (server)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses direct URL when configured', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    expect(resolveApiBaseUrl()).toBe('http://localhost:3001');
  });
});
