/**
 * AuthCard — boutique hairline panel with a Fraunces heading and optional
 * subtext. Behaviour: level-1 heading, subtext rendered only when provided.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthCard } from '@/components/auth/AuthCard';

describe('AuthCard', () => {
  it('renders the heading and subtext with boutique chrome', () => {
    render(
      <AuthCard heading="Welcome back" subtext="Sign in to continue">
        <p>form</p>
      </AuthCard>,
    );
    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Welcome back',
    });
    expect(heading).toHaveClass('font-display');
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByText('form')).toBeInTheDocument();
  });

  it('omits the subtext paragraph when none is given', () => {
    render(
      <AuthCard heading="Check your email">
        <p>body</p>
      </AuthCard>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Check your email' }),
    ).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
