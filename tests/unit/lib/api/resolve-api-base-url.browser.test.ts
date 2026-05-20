/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEV_API_PROXY_PATH,
  resolveApiBaseUrl,
} from '@/lib/api/resolve-api-base-url';

describe('resolveApiBaseUrl (browser)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses proxy path for loopback API URL in the browser', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    const vitestFlag = process.env.VITEST;
    delete process.env.VITEST;
    try {
      expect(resolveApiBaseUrl()).toBe(DEV_API_PROXY_PATH);
    } finally {
      if (vitestFlag !== undefined) {
        process.env.VITEST = vitestFlag;
      }
    }
  });

  it('uses full URL for deployed API', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_API_URL',
      'https://petsupplies-api-staging.example.railway.app',
    );
    expect(resolveApiBaseUrl()).toBe(
      'https://petsupplies-api-staging.example.railway.app',
    );
  });

  it('uses direct loopback URL in Vitest (jsdom API tests)', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    expect(resolveApiBaseUrl()).toBe('http://localhost:3001');
  });
});
