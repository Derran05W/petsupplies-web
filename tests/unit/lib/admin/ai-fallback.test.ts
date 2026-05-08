/**
 * Covers `streamFallbackDescription` from `lib/admin/ai-fallback.ts`.
 *
 * What's covered:
 *   - happy path: yields chunks until the template is fully emitted,
 *     each chunk falls within the documented [60, 80] character size
 *     window, and the concatenated result interpolates `{name}` and
 *     appends an optional refinement footer.
 *   - generic-fallback template branch: combinations not in the table
 *     fall through to the generic blurb (no thrown error).
 *   - abort path: triggering `AbortSignal` mid-stream resolves the
 *     iterator immediately without yielding additional chunks.
 *
 * What's NOT covered: the per-template content itself (out of scope —
 * the templates are content data, not behaviour).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { streamFallbackDescription } from '@/lib/admin/ai-fallback';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

async function collect(
  iter: AsyncGenerator<string, void, void>,
): Promise<string[]> {
  const chunks: string[] = [];
  // Drive the generator: each iteration awaits a `setTimeout(80)`, so
  // we tick the fake timers between reads.
  while (true) {
    const next = iter.next();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(80);
    const result = await next;
    if (result.done) break;
    chunks.push(result.value);
  }
  return chunks;
}

describe('streamFallbackDescription', () => {
  describe('happy path', () => {
    it('yields chunks within [60, 80] chars and interpolates {name}', async () => {
      const iter = streamFallbackDescription({
        name: 'Salmon Treats',
        category: 'treats',
        petType: 'dog',
      });

      const chunks = await collect(iter);

      expect(chunks.length).toBeGreaterThan(0);
      const joined = chunks.join('');
      expect(joined).toContain('Salmon Treats');
      // every chunk except possibly the final tail respects the width.
      const widths = chunks.map((c) => c.length);
      const interior = widths.slice(0, -1);
      for (const width of interior) {
        expect(width).toBeGreaterThanOrEqual(60);
        expect(width).toBeLessThanOrEqual(80);
      }
      const tail = widths[widths.length - 1];
      expect(tail).toBeGreaterThan(0);
      expect(tail).toBeLessThanOrEqual(80);
    });

    it('appends a refinement footer when one is provided', async () => {
      const iter = streamFallbackDescription({
        name: 'Salmon Treats',
        category: 'treats',
        petType: 'dog',
        refinement: 'extra crunchy',
      });

      const joined = (await collect(iter)).join('');
      expect(joined).toContain('Refinement: extra crunchy.');
    });

    it('falls back to the generic template for unknown {category, petType} combos', async () => {
      const iter = streamFallbackDescription({
        name: 'Bird Whistle',
        category: 'accessories',
        petType: 'bird',
      });

      const joined = (await collect(iter)).join('');
      expect(joined).toContain('Bird Whistle');
      expect(joined.length).toBeGreaterThan(0);
    });
  });

  describe('abort path', () => {
    it('resolves the iterator after the next yield once aborted', async () => {
      const controller = new AbortController();
      const iter = streamFallbackDescription({
        name: 'Salmon Treats',
        category: 'treats',
        petType: 'dog',
        signal: controller.signal,
      });

      // Pull the first chunk normally.
      const first = iter.next();
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(80);
      const firstResult = await first;
      expect(firstResult.done).toBe(false);

      // Abort, then drive the iterator to completion — it should
      // resolve immediately rather than continuing to yield.
      controller.abort();
      const second = iter.next();
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(80);
      const secondResult = await second;

      expect(secondResult.done).toBe(true);
    });
  });
});
