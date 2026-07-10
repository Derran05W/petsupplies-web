/**
 * Tonal gradient tiles from the mockup (bg-a…bg-d): gradient background +
 * matching line-art icon ink. Kept in a server-safe module (no 'use client')
 * so server components can cycle TILE_TONES without importing a client
 * module's exports.
 */
export type TileTone = 'amber' | 'slate' | 'sage' | 'clay';

export const TONE_CLASSES: Record<TileTone, string> = {
  amber: 'bg-tile-amber text-tile-amber-ink',
  slate: 'bg-tile-slate text-tile-slate-ink',
  sage: 'bg-tile-sage text-tile-sage-ink',
  clay: 'bg-tile-clay text-tile-clay-ink',
};

/** Cycle for grids: `tone={TILE_TONES[i % TILE_TONES.length]}` like the mockup's bg-a…bg-d. */
export const TILE_TONES: TileTone[] = ['amber', 'slate', 'sage', 'clay'];
