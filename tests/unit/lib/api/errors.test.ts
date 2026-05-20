import { describe, expect, it } from 'vitest';
import { parseApiErrorMessage } from '@/lib/api/errors';

describe('parseApiErrorMessage', () => {
  it('parses hono zod-validator nested JSON issues', () => {
    const message = parseApiErrorMessage({
      success: false,
      error: {
        name: 'ZodError',
        message: JSON.stringify([
          {
            expected: 'int',
            code: 'invalid_type',
            path: ['price'],
            message: 'Invalid input: expected int, received null',
          },
        ]),
      },
    });

    expect(message).toBe('price: Invalid input: expected int, received null');
  });

  it('reads top-level error string from errorHandler', () => {
    expect(parseApiErrorMessage({ error: 'Slug already exists' })).toBe(
      'Slug already exists',
    );
  });
});
