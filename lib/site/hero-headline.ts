export type HeroHeadlineWord = { text: string; em: boolean };

export type HeroHeadlineRow = {
  words: HeroHeadlineWord[];
  /** Pet tile slots in before this word index (== words.length appends it). */
  tileBeforeIndex: number;
};

/**
 * Lay the admin-entered hero headline out as the mockup's interleaved
 * display type (`.hl`): two centered rows with a tonal pet tile dropped
 * into the middle of each, and the first word of the second row set in
 * italics (matching the mockup's "Food [🐶] they'll / *actually* [🐱]
 * love." treatment). Headlines of one or two words collapse to a single
 * row; the tile still lands between/after the words.
 */
export function buildHeroHeadline(headline: string): HeroHeadlineRow[] {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const rowsOfText =
    words.length <= 2
      ? [words]
      : [
          words.slice(0, Math.ceil(words.length / 2)),
          words.slice(Math.ceil(words.length / 2)),
        ];

  return rowsOfText.map((rowWords, rowIndex) => ({
    words: rowWords.map((text, wordIndex) => ({
      text,
      em: rowIndex === 1 && wordIndex === 0,
    })),
    tileBeforeIndex: Math.max(1, Math.floor(rowWords.length / 2)),
  }));
}
