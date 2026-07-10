'use client';

import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

const markdownClassName = cn(
  'font-body text-ink-secondary [&_a]:text-pine [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-ink',
  '[&_h1]:mb-4 [&_h1]:font-display [&_h1]:text-display [&_h1]:text-ink',
  '[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-title [&_h2]:text-ink',
  '[&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:font-body [&_h3]:text-label [&_h3]:uppercase [&_h3]:text-pine',
  '[&_p]:mb-4 [&_p]:leading-body',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-1 [&_li]:leading-body [&_strong]:font-semibold [&_strong]:text-ink',
  '[&_blockquote]:my-4 [&_blockquote]:border-l [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-muted',
  '[&_hr]:my-8 [&_hr]:border-line',
  '[&_code]:rounded-tag [&_code]:bg-ink/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm',
  '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
  '[&_th]:border [&_th]:border-line [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-body [&_th]:text-label [&_th]:uppercase [&_th]:text-ink',
  '[&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_td]:text-ink-secondary',
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
