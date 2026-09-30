/**
 * Covers `<SiteSettingsRewardsForm />`
 * (components/admin/settings/SiteSettingsRewardsForm.tsx).
 *
 * Mock boundary: `@/hooks/useSiteSettings` — the query seeds the initial tiers
 * and the mutation is a spy so we assert the exact `rewardTiers` payload.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteSettingsRewardsForm } from '@/components/admin/settings/SiteSettingsRewardsForm';
import type { RewardTier } from '@/types/site';

const mutateAsync = vi.fn();
let queryData: { rewardTiers: RewardTier[] } | undefined;

vi.mock('@/hooks/useSiteSettings', () => ({
  useSiteSettingsQuery: () => ({
    data: queryData,
    isPending: false,
    error: null,
  }),
  useUpdateSiteSettingsMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

beforeEach(() => {
  mutateAsync.mockReset();
  queryData = { rewardTiers: [] };
});

describe('admin/settings/SiteSettingsRewardsForm', () => {
  it('adds and removes tier rows', async () => {
    const user = userEvent.setup();
    render(<SiteSettingsRewardsForm />);

    expect(screen.queryByText('Tier 1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add tier/i }));
    expect(screen.getByText('Tier 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add tier/i }));
    expect(screen.getByText('Tier 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove tier 2/i }));
    expect(screen.queryByText('Tier 2')).not.toBeInTheDocument();
    expect(screen.getByText('Tier 1')).toBeInTheDocument();
  });

  it('blocks submit when two tiers share a threshold', async () => {
    const user = userEvent.setup();
    render(<SiteSettingsRewardsForm />);

    await user.click(screen.getByRole('button', { name: /add tier/i }));
    await user.click(screen.getByRole('button', { name: /add tier/i }));

    const thresholds = screen.getAllByLabelText(/spend threshold/i);
    const labels = screen.getAllByLabelText(/reward label/i);

    await user.type(thresholds[0]!, '49');
    await user.type(labels[0]!, 'Dish sponge');
    await user.type(thresholds[1]!, '49');
    await user.type(labels[1]!, 'Feeding mat');

    await user.click(screen.getByRole('button', { name: /save rewards/i }));

    expect(
      screen.getByText(/each tier needs a unique spend threshold/i),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('blocks submit when a tier is missing its label', async () => {
    const user = userEvent.setup();
    render(<SiteSettingsRewardsForm />);

    await user.click(screen.getByRole('button', { name: /add tier/i }));
    await user.type(screen.getByLabelText(/spend threshold/i), '49');

    await user.click(screen.getByRole('button', { name: /save rewards/i }));

    expect(
      screen.getByText(/every reward tier needs a label/i),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('submits tiers sorted ascending with dollar inputs converted to cents', async () => {
    mutateAsync.mockResolvedValue({
      rewardTiers: [
        { thresholdCents: 4900, label: 'Dish sponge' },
        { thresholdCents: 19900, label: 'Feeding mat' },
      ],
    });
    const user = userEvent.setup();
    render(<SiteSettingsRewardsForm />);

    await user.click(screen.getByRole('button', { name: /add tier/i }));
    await user.click(screen.getByRole('button', { name: /add tier/i }));

    const thresholds = screen.getAllByLabelText(/spend threshold/i);
    const labels = screen.getAllByLabelText(/reward label/i);

    // Entered out of order — save should sort ascending.
    await user.type(thresholds[0]!, '199');
    await user.type(labels[0]!, 'Feeding mat');
    await user.type(thresholds[1]!, '49');
    await user.type(labels[1]!, 'Dish sponge');

    await user.click(screen.getByRole('button', { name: /save rewards/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync).toHaveBeenCalledWith({
      rewardTiers: [
        { thresholdCents: 4900, label: 'Dish sponge' },
        { thresholdCents: 19900, label: 'Feeding mat' },
      ],
    });
  });
});
