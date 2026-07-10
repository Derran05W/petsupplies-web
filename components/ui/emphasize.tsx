import type { ReactNode } from 'react';

/**
 * Render `*emphasis*` spans in plain-string copy as `<em>` — the display
 * headings style them italic at weight 500 (see SectionHeader's `[&_em]`
 * rules). Keeps admin-editable / variable copy as plain strings while
 * preserving the mockup's italic accents.
 */
export function emphasize(text: string): ReactNode {
  const parts = text.split(/\*([^*]+)\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index % 2 === 1 ? <em key={index}>{part}</em> : part,
  );
}
