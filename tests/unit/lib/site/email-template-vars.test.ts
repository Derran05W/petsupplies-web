import { describe, expect, it } from 'vitest';
import {
  EMAIL_TEMPLATE_ALLOWED_VARS,
  EMAIL_TEMPLATE_KEYS,
  allowedVarsForTemplate,
} from '@/lib/site/email-template-vars';

describe('email template variable reference', () => {
  it('defines allow-lists for every template key', () => {
    for (const key of EMAIL_TEMPLATE_KEYS) {
      expect(EMAIL_TEMPLATE_ALLOWED_VARS[key]).toBeDefined();
      expect(EMAIL_TEMPLATE_ALLOWED_VARS[key].length).toBeGreaterThan(0);
    }
  });

  it('wraps variables as Mustache tokens for the editor sidebar', () => {
    const tokens = allowedVarsForTemplate('order-confirmation');
    expect(tokens).toContain('{{order.number}}');
    expect(tokens).toContain('{{brand.name}}');
    expect(tokens.every((t) => t.startsWith('{{') && t.endsWith('}}'))).toBe(
      true,
    );
  });
});
