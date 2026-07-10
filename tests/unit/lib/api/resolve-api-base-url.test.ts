/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  normalizeConfiguredApiUrl,
  resolveApiBaseUrl,
} from '@/lib/api/resolve-api-base-url';

describe('normalizeConfiguredApiUrl', () => {
  it('adds https when the secret is a bare hostname', () => {
    expect(
      normalizeConfiguredApiUrl('petsupplies-api.example.railway.app'),
    ).toBe('https://petsupplies-api.example.railway.app');
  });

  it('trims whitespace and trailing slashes', () => {
    expect(normalizeConfiguredApiUrl('  https://api.test/  ')).toBe(
      'https://api.test',
    );
  });
});

describe('resolveApiBaseUrl (server)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses direct URL when configured', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    expect(resolveApiBaseUrl()).toBe('http://localhost:3001');
  });
});
