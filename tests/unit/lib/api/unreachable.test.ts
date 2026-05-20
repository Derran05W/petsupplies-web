import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { isBackendUnreachableError } from '@/lib/api/unreachable';

describe('isBackendUnreachableError', () => {
  it('treats network errors as unreachable', () => {
    expect(isBackendUnreachableError(new ApiError('offline', 0))).toBe(true);
  });

  it('treats Railway application-not-found 404 as unreachable', () => {
    expect(
      isBackendUnreachableError(new ApiError('Application not found', 404)),
    ).toBe(true);
  });

  it('does not treat a normal API 404 as unreachable', () => {
    expect(isBackendUnreachableError(new ApiError('Not found', 404))).toBe(
      false,
    );
  });
});
