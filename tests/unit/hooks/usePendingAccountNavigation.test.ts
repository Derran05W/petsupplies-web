import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NAVIGATION_FEEDBACK_DELAY_MS } from '@/hooks/useDelayedPending';
import { usePendingAccountNavigation } from '@/hooks/usePendingAccountNavigation';

const pathnameRef = { current: '/products' };

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameRef.current,
}));

describe('usePendingAccountNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pathnameRef.current = '/products';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows delayed spinner while still off account', () => {
    const { result, rerender } = renderHook(() =>
      usePendingAccountNavigation('/account'),
    );

    act(() => result.current.markPending());
    expect(result.current.showSpinner).toBe(false);

    act(() => vi.advanceTimersByTime(NAVIGATION_FEEDBACK_DELAY_MS));
    expect(result.current.showSpinner).toBe(true);

    pathnameRef.current = '/account';
    rerender();
    expect(result.current.showSpinner).toBe(false);
  });
});
