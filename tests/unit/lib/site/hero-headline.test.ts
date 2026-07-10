import { describe, expect, it } from 'vitest';
import { buildHeroHeadline } from '@/lib/site/hero-headline';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';

describe('buildHeroHeadline', () => {
  it('lays the seeded headline out exactly like the mockup', () => {
    const rows = buildHeroHeadline(SITE_SETTINGS_FALLBACK.heroHeadline);

    expect(rows).toEqual([
      {
        words: [
          { text: 'Food', em: false },
          { text: "they'll", em: false },
        ],
        tileBeforeIndex: 1,
      },
      {
        words: [
          { text: 'actually', em: true },
          { text: 'love.', em: false },
        ],
        tileBeforeIndex: 1,
      },
    ]);
  });

  it('returns no rows for empty or whitespace-only headlines', () => {
    expect(buildHeroHeadline('')).toEqual([]);
    expect(buildHeroHeadline('   ')).toEqual([]);
  });

  it('keeps one- and two-word headlines on a single row', () => {
    expect(buildHeroHeadline('Treats!')).toEqual([
      { words: [{ text: 'Treats!', em: false }], tileBeforeIndex: 1 },
    ]);

    const two = buildHeroHeadline('Good food');
    expect(two).toHaveLength(1);
    expect(two[0]!.words.map((w) => w.text)).toEqual(['Good', 'food']);
    expect(two[0]!.tileBeforeIndex).toBe(1);
  });

  it('splits odd word counts with the longer row first and ems the second row lead', () => {
    const rows = buildHeroHeadline('Five words of headline here');

    expect(rows[0]!.words.map((w) => w.text)).toEqual(['Five', 'words', 'of']);
    expect(rows[1]!.words.map((w) => w.text)).toEqual(['headline', 'here']);
    expect(rows[1]!.words[0]!.em).toBe(true);
    expect(rows[0]!.words.every((w) => !w.em)).toBe(true);
  });

  it('collapses repeated whitespace between words', () => {
    const rows = buildHeroHeadline('  Food   they’ll   actually love. ');
    expect(rows.flatMap((row) => row.words).map((w) => w.text)).toEqual([
      'Food',
      'they’ll',
      'actually',
      'love.',
    ]);
  });
});
