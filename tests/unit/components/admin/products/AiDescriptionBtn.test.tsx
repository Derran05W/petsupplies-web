/**
 * Covers `<AiDescriptionBtn />` from
 * `components/admin/products/AiDescriptionBtn.tsx`.
 *
 * What's covered:
 *   - validation guards: missing name → "Add a product name first." alert
 *     (no stream call). Missing category → "Pick a category first." alert.
 *   - happy path: click "Generate with AI" → onStart → mocked stream
 *     emits three chunks → onChunk receives each in order → onComplete
 *     fires → status text reads "Description generated."
 *   - cancel path: while streaming, the button is "Cancel"; clicking it
 *     aborts the controller (the mock observes `signal.aborted`) →
 *     status text reads "Generation cancelled."
 *
 * Mock boundary:
 *   - `@/lib/api/admin/ai` (`generateDescriptionStreamForAdminCategory`) so the real
 *     network / fallback streaming code never runs from this test.
 *   - `@/lib/supabase/client` so the access-token call resolves
 *     immediately to a known value.
 *
 * What's NOT covered here: the underlying fallback / network branches
 * — those are unit-tested separately in
 * `tests/unit/lib/api/admin/ai-fallback.test.ts`.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AiDescriptionBtn } from '@/components/admin/products/AiDescriptionBtn';
import { mockSupabaseClient } from '@/tests/mocks/supabase';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () =>
    mockSupabaseClient({
      session: { access_token: 'token-123' },
    }),
}));

const generateMock = vi.fn();
vi.mock('@/lib/api/admin/ai', () => ({
  generateDescriptionStreamForAdminCategory: (...args: unknown[]) =>
    generateMock(...args),
}));

beforeEach(() => {
  generateMock.mockReset();
});

interface RenderOptions {
  name?: string;
  category?: 'DOG' | 'CAT' | undefined;
}

function renderBtn(options: RenderOptions = {}) {
  const onStart = vi.fn();
  const onChunk = vi.fn();
  const onComplete = vi.fn();
  const props = {
    name: options.name ?? 'Salmon Treats',
    category: 'category' in options ? options.category : ('DOG' as const),
    onStart,
    onChunk,
    onComplete,
  };
  render(<AiDescriptionBtn {...props} />);
  return { onStart, onChunk, onComplete };
}

describe('AiDescriptionBtn', () => {
  describe('validation', () => {
    it('shows "Add a product name first." when the name is empty', async () => {
      const user = userEvent.setup();
      const { onStart } = renderBtn({ name: '' });

      await user.click(
        screen.getByRole('button', { name: /generate with ai/i }),
      );

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Add a product name first.');
      expect(onStart).not.toHaveBeenCalled();
      expect(generateMock).not.toHaveBeenCalled();
    });

    it('shows "Pick a category first." when classification is incomplete', async () => {
      const user = userEvent.setup();
      const { onStart } = renderBtn({
        name: 'Salmon Treats',
        category: undefined,
      });

      await user.click(
        screen.getByRole('button', { name: /generate with ai/i }),
      );

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Pick a category first.');
      expect(onStart).not.toHaveBeenCalled();
      expect(generateMock).not.toHaveBeenCalled();
    });
  });

  describe('happy path', () => {
    it('streams chunks in order and announces "Description generated."', async () => {
      const user = userEvent.setup();
      generateMock.mockImplementation(
        async (
          _name: unknown,
          _category: unknown,
          _accessToken: unknown,
          options: { onChunk: (chunk: string) => void },
        ) => {
          options.onChunk('chunk-1 ');
          options.onChunk('chunk-2 ');
          options.onChunk('chunk-3.');
        },
      );

      const { onStart, onChunk, onComplete } = renderBtn();

      await user.click(
        screen.getByRole('button', { name: /generate with ai/i }),
      );

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenNthCalledWith(1, 'chunk-1 ');
      expect(onChunk).toHaveBeenNthCalledWith(2, 'chunk-2 ');
      expect(onChunk).toHaveBeenNthCalledWith(3, 'chunk-3.');
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Description generated.',
      );
    });
  });

  describe('cancel path', () => {
    it('aborts the in-flight stream and announces "Generation cancelled."', async () => {
      const user = userEvent.setup();

      // Hold the stream pending until the test calls `release` so we can
      // observe the Cancel button mid-flight.
      let release: () => void = () => {};
      let observedSignal: AbortSignal | undefined;
      generateMock.mockImplementation(
        (
          _name: unknown,
          _category: unknown,
          _accessToken: unknown,
          options: { signal?: AbortSignal },
        ) => {
          observedSignal = options.signal;
          return new Promise<void>((resolve) => {
            release = resolve;
          });
        },
      );

      const { onComplete } = renderBtn();

      await user.click(
        screen.getByRole('button', { name: /generate with ai/i }),
      );

      const cancelButton = await screen.findByRole('button', {
        name: /cancel/i,
      });
      await user.click(cancelButton);

      expect(observedSignal?.aborted).toBe(true);
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Generation cancelled.',
      );
      expect(onComplete).toHaveBeenCalled();

      // Resolve the pending promise so the post-cancel `finally` doesn't
      // leak a microtask warning across tests.
      await act(async () => {
        release();
      });
    });
  });
});
