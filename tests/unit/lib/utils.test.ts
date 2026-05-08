/**
 * Covers `cn(...)` from `lib/utils.ts`.
 *
 * What's covered:
 *   - tailwind-merge dedupes conflicting utility classes.
 *   - clsx semantics: falsy filtering + array + object inputs.
 *
 * What's NOT covered: nothing — `cn` is the entire module.
 */
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  describe('tailwind-merge behaviour', () => {
    it('dedupes conflicting tailwind utilities (last wins)', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
      expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500');
    });

    it('keeps non-conflicting utilities intact', () => {
      expect(cn('flex', 'items-center', 'gap-2')).toBe(
        'flex items-center gap-2',
      );
    });
  });

  describe('clsx semantics', () => {
    it('filters falsy inputs (false / undefined / null / empty string)', () => {
      expect(cn('foo', false, undefined, null, '', 'bar')).toBe('foo bar');
    });

    it('accepts array inputs', () => {
      expect(cn(['foo', 'bar'], ['baz'])).toBe('foo bar baz');
    });

    it('accepts object inputs (truthy keys are emitted)', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('combines arrays, objects, and strings together', () => {
      expect(
        cn('foo', ['bar', { baz: true, qux: false }], undefined, 'quux'),
      ).toBe('foo bar baz quux');
    });

    it('returns an empty string when all inputs are falsy', () => {
      expect(cn(false, undefined, null, '')).toBe('');
    });
  });
});
