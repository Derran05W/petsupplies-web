import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { DrawerPortal } from '@/components/layout/DrawerPortal';

describe('DrawerPortal', () => {
  it('mounts children on document.body after hydration', async () => {
    const { container } = render(
      <div id="tree-root">
        <DrawerPortal>
          <div data-testid="ported-content">drawer</div>
        </DrawerPortal>
      </div>,
    );

    await waitFor(() =>
      expect(
        document.body.querySelector('[data-testid="ported-content"]'),
      ).not.toBeNull(),
    );
    expect(
      container.querySelector('[data-testid="ported-content"]'),
    ).toBeNull();
  });
});
