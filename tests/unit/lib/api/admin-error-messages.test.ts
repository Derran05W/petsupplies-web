import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  adminApiErrorMessage,
  adminErrorMessagesForTests,
  adminSectionErrorMessage,
} from '@/lib/api/admin/error-messages';

describe('adminApiErrorMessage', () => {
  it('maps 401 to session message', () => {
    expect(adminApiErrorMessage(new ApiError('Unauthorized', 401))).toBe(
      adminErrorMessagesForTests.SESSION_ERROR_MESSAGE,
    );
  });

  it('maps 403 Forbidden to DB mismatch hint', () => {
    expect(adminApiErrorMessage(new ApiError('Forbidden', 403))).toBe(
      adminErrorMessagesForTests.FORBIDDEN_DB_MISMATCH_MESSAGE,
    );
  });

  it('maps 403 with sync_auth_user hint in message', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(
      adminApiErrorMessage(
        new ApiError(
          'Admin JWT valid but no public.User row. Apply sync_auth_user trigger.',
          403,
        ),
      ),
    ).toBe(adminErrorMessagesForTests.FORBIDDEN_DB_MISMATCH_MESSAGE);
    vi.unstubAllEnvs();
  });

  it('surfaces API message body in development for 403', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const detail = 'Custom operator hint from API';
    expect(adminApiErrorMessage(new ApiError(detail, 403))).toBe(detail);
    vi.unstubAllEnvs();
  });

  it('maps 502 missing bucket to storage setup hint for image uploads', () => {
    expect(
      adminApiErrorMessage(
        new ApiError('Storage error: The related resource does not exist', 502),
        'image',
      ),
    ).toContain('product-images');
  });
});

describe('adminSectionErrorMessage', () => {
  it('uses mapped copy for ApiError', () => {
    expect(
      adminSectionErrorMessage(new ApiError('Forbidden', 403), 'Fallback'),
    ).toBe(adminErrorMessagesForTests.FORBIDDEN_DB_MISMATCH_MESSAGE);
  });

  it('uses fallback for non-ApiError', () => {
    expect(adminSectionErrorMessage(new Error('x'), 'Fallback')).toBe('x');
    expect(adminSectionErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});
