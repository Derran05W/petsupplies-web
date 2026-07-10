import Image from 'next/image';
import { fetchSiteSettings } from '@/lib/api/site/settings';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';
import { buildHeroHeadline } from '@/lib/site/hero-headline';
import { Button, PetIcon, type PetIconName } from '@/components/ui';
import { TONE_CLASSES, type TileTone } from '@/components/ui/tones';
import { cn } from '@/lib/utils';

/** Tonal tile dropped into each headline row — dog/amber then cat/slate, like the mockup. */
const ROW_TILES: { tone: TileTone; icon: PetIconName }[] = [
  { tone: 'amber', icon: 'dog' },
  { tone: 'slate', icon: 'cat' },
  { tone: 'sage', icon: 'yarn' },
  { tone: 'clay', icon: 'bowl' },
];

/** Mockup load-in rhythm: words 100ms apart, rows offset 150ms, tiles pop mid-row. */
const WORD_BASE_MS = 200;
const WORD_STEP_MS = 100;
const ROW_OFFSET_MS = 150;
const TILE_BASE_MS = 450;
const TILE_ROW_STEP_MS = 400;

function resolveHeroImageUrl(url: string | undefined): string {
  if (!url || url.trim().length === 0) {
    return SITE_SETTINGS_FALLBACK.heroImageUrl;
  }
  return url.trim();
}

/**
 * Boutique hero (mockup `.hero`): centered kicker, the admin-entered
 * headline interleaved with tonal pet tiles, subhead, and pill CTAs — all
 * fading up on load. The admin's hero image fills the last row's tile
 * (the mockup's media slot); the other tiles keep their line-art icons.
 */
export async function Hero() {
  const settings = await fetchSiteSettings();

  const rows = buildHeroHeadline(settings.heroHeadline);
  const heroImageUrl = resolveHeroImageUrl(settings.heroImageUrl);
  const isRemote = heroImageUrl.startsWith('http');

  const totalWords = rows.reduce((sum, row) => sum + row.words.length, 0);
  const lastWordDelay =
    WORD_BASE_MS +
    Math.max(0, totalWords - 1) * WORD_STEP_MS +
    Math.max(0, rows.length - 1) * ROW_OFFSET_MS;

  let wordIndex = 0;

  return (
    <section className="px-gutter pb-[10vh] pt-[9vh] text-center">
      <p className="animate-fade-up mb-10 font-body text-kicker uppercase text-pine [animation-delay:100ms]">
        {settings.heroEyebrow}
      </p>

      <h1 className="font-display text-display-xl text-ink [&_em]:font-medium [&_em]:italic">
        {rows.map((row, rowIndex) => {
          const tile = ROW_TILES[rowIndex % ROW_TILES.length] ?? ROW_TILES[0]!;
          const isMediaTile = rowIndex === rows.length - 1;
          const tileDelay = TILE_BASE_MS + rowIndex * TILE_ROW_STEP_MS;

          const parts: React.ReactNode[] = [];
          row.words.forEach((word, indexInRow) => {
            if (indexInRow === row.tileBeforeIndex) {
              parts.push(
                <HeadlineTile
                  key={`tile-${rowIndex}`}
                  tone={tile.tone}
                  icon={tile.icon}
                  delayMs={tileDelay}
                  imageUrl={isMediaTile ? heroImageUrl : undefined}
                  imageUnoptimized={isRemote}
                />,
              );
            }
            const delay =
              WORD_BASE_MS +
              wordIndex * WORD_STEP_MS +
              rowIndex * ROW_OFFSET_MS;
            wordIndex += 1;
            parts.push(
              <span
                key={`word-${rowIndex}-${indexInRow}`}
                className="animate-fade-up inline-block"
                style={{ animationDelay: `${delay}ms` }}
              >
                {word.em ? <em>{word.text}</em> : word.text}
              </span>,
            );
          });
          if (row.tileBeforeIndex >= row.words.length) {
            parts.push(
              <HeadlineTile
                key={`tile-${rowIndex}`}
                tone={tile.tone}
                icon={tile.icon}
                delayMs={tileDelay}
                imageUrl={isMediaTile ? heroImageUrl : undefined}
                imageUnoptimized={isRemote}
              />,
            );
          }

          return (
            <span
              key={rowIndex}
              className="flex flex-wrap items-center justify-center gap-x-[0.35em]"
            >
              {parts}
            </span>
          );
        })}
      </h1>

      <p
        className="animate-fade-up mx-auto mt-10 max-w-[52ch] font-body text-lede text-ink-secondary"
        style={{ animationDelay: `${lastWordDelay + 500}ms` }}
      >
        {settings.heroSubhead}
      </p>

      <div
        className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-4"
        style={{ animationDelay: `${lastWordDelay + 650}ms` }}
      >
        <Button href={settings.heroPrimaryCtaHref}>
          {settings.heroPrimaryCtaLabel}
        </Button>
        <Button variant="ghost" href={settings.heroSecondaryCtaHref}>
          {settings.heroSecondaryCtaLabel}
        </Button>
      </div>
    </section>
  );
}

/**
 * `.hl-tile` — sized off the headline's em box so it scales with the
 * clamp. Entry animation and hover transform live on separate elements:
 * the entry animation's `forwards` fill pins `transform` on its element,
 * so a hover transform there would never apply.
 */
function HeadlineTile({
  tone,
  icon,
  delayMs,
  imageUrl,
  imageUnoptimized,
}: {
  tone: TileTone;
  icon: PetIconName;
  delayMs: number;
  imageUrl?: string;
  imageUnoptimized?: boolean;
}) {
  return (
    <span
      aria-hidden
      className="inline-block aspect-[1.5] h-[0.92em] flex-none transition-transform duration-base ease-soft hover:rotate-2 hover:scale-[1.14] motion-reduce:transform-none"
    >
      <span
        className={cn(
          'animate-tile-in relative flex h-full w-full items-center justify-center overflow-hidden rounded-[0.16em]',
          TONE_CLASSES[tone],
        )}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="160px"
            className="object-cover"
            unoptimized={imageUnoptimized}
          />
        ) : (
          <PetIcon name={icon} className="h-[58%] w-[58%]" />
        )}
      </span>
    </span>
  );
}
