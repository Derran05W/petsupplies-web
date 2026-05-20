import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownContent } from '@/components/content/MarkdownContent';

describe('MarkdownContent sanitizer', () => {
  it('strips script tags from rendered markdown HTML', () => {
    const { container } = render(
      <MarkdownContent markdown={'Hello\n\n<script>alert("xss")</script>'} />,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders safe markdown links', () => {
    render(<MarkdownContent markdown="[About](/about)" />);
    const link = screen.getByRole('link', { name: 'About' });
    expect(link).toHaveAttribute('href', '/about');
  });
});
