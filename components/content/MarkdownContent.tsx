'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

const markdownClassName = cn(
  'font-body text-warm-800 [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-700',
  '[&_h1]:mb-4 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:tracking-[-0.02em] [&_h1]:text-warm-900',
  '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-warm-900',
  '[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-body [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-warm-900',
  '[&_p]:mb-4 [&_p]:leading-relaxed',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-warm-900',
  '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-warm-600',
);

interface MarkdownContentProps {
  markdown: string;
  className?: string;
}

export function MarkdownContent({ markdown, className }: MarkdownContentProps) {
  return (
    <div className={cn(markdownClassName, className)}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{markdown}</ReactMarkdown>
    </div>
  );
}
