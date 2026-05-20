import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  NAVIGATION_FEEDBACK_DELAY_MS,
  useDelayedPending,
} from '@/hooks/useDelayedPending';

describe('useDelayedPending', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays false until delay elapses while pending', () => {
    const { result, rerender } = renderHook(
      ({ pending }) => useDelayedPending(pending, NAVIGATION_FEEDBACK_DELAY_MS),
      { initialProps: { pending: true } },
    );

    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(NAVIGATION_FEEDBACK_DELAY_MS - 1));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
    rerender({ pending: false });
    expect(result.current).toBe(false);
  });

  it('never shows if pending clears before delay', () => {
    const { result, rerender } = renderHook(
      ({ pending }) => useDelayedPending(pending, NAVIGATION_FEEDBACK_DELAY_MS),
      { initialProps: { pending: true } },
    );

    act(() => vi.advanceTimersByTime(400));
    rerender({ pending: false });
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe(false);
  });
});
