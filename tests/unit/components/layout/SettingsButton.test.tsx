/**
 * Navbar settings trigger — forwards ref for focus return after drawer closes.
 */
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { SettingsButton } from '@/components/layout/SettingsButton';

describe('SettingsButton', () => {
  it('has dialog popup semantics and calls onOpen when clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(<SettingsButton onOpen={onOpen} />);

    const btn = screen.getByRole('button', { name: /open settings/i });
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');

    await user.click(btn);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
