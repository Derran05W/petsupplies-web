import { describe, expect, it } from 'vitest';
import { addressInputSchema } from '@/lib/account/schemas';

/**
 * The app maps a saved address's `fullName` onto the backend `label` column,
 * which is capped at 50 chars (`z.string().trim().max(50)` in
 * petsupplies-api addresses.ts). The client schema must cap it identically —
 * trimming first — so the form never accepts a name the server rejects.
 */
const VALID_BASE = {
  line1: '123 Maple Street',
  city: 'Toronto',
  state: 'ON',
  postalCode: 'M5V 2T6',
  country: 'CA' as const,
  isDefault: false,
};

describe('addressInputSchema fullName cap', () => {
  it('accepts a 50-character name', () => {
    const result = addressInputSchema.safeParse({
      ...VALID_BASE,
      fullName: 'a'.repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it('rejects a 51-character name with the 50-char message', () => {
    const result = addressInputSchema.safeParse({
      ...VALID_BASE,
      fullName: 'a'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'fullName');
      expect(issue?.message).toBe('Full name must be 50 characters or fewer');
    }
  });

  it('trims before length-checking (surrounding whitespace does not count)', () => {
    // 50 non-space chars wrapped in whitespace: 54 raw, 50 trimmed → valid,
    // and the parsed value is trimmed, matching the backend .trim().max(50).
    const result = addressInputSchema.safeParse({
      ...VALID_BASE,
      fullName: `  ${'a'.repeat(50)}  `,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('a'.repeat(50));
    }
  });

  it('rejects an over-cap name even though it is under the 120-char checkout limit', () => {
    // 80 chars is valid for the guest checkout form but not for a saved address.
    const result = addressInputSchema.safeParse({
      ...VALID_BASE,
      fullName: 'a'.repeat(80),
    });
    expect(result.success).toBe(false);
  });
});
