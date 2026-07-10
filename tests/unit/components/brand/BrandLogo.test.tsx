/**
 * BrandLogo — boutique Fraunces wordmark. Links to home by default and
 * renders a non-link span when href is null (mobile menu header).
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import type { Brand } from '@/lib/config/brand';

const brand = { name: "Aileen's petstore" } as Brand;

describe('BrandLogo', () => {
  it('renders the full brand name as a home link', () => {
    render(<BrandLogo brand={brand} />);
    const link = screen.getByRole('link', { name: brand.name });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveTextContent(brand.name);
    expect(link).toHaveClass('font-display', 'italic');
  });

  it('renders a non-link span when href is null', () => {
    render(<BrandLogo brand={brand} href={null} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText(brand.name)).toBeInTheDocument();
  });
});
