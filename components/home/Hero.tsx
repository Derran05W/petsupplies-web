import Image from 'next/image';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { fetchSiteSettings } from '@/lib/api/site/settings';
import { getFreeShippingThresholdCents } from '@/lib/config/shipping';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';
import { formatFreeShippingLabel } from '@/lib/site/shipping-copy';

/**
 * 1×1 warm-100 (#F7F3EC) JPEG, base64-encoded. Used as `blurDataURL`
 * so the hero slot still paints in brand colors before the real image
 * loads — and remains tasteful if the underlying file is missing.
 */
const HERO_BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgB//Z';

function splitTagline(tagline: string): { lead: string; accent: string } {
  const trimmed = tagline.trimEnd();
  const match = trimmed.match(/^(.*?)(\S+)([.!?]?)$/);
  if (!match) return { lead: '', accent: trimmed };
  const [, lead, lastWord, terminator] = match;
  return {
    lead: lead ?? '',
    accent: `${lastWord ?? ''}${terminator ?? ''}`,
  };
}

function resolveHeroImageUrl(url: string | undefined): string {
  if (!url || url.trim().length === 0) {
    return SITE_SETTINGS_FALLBACK.heroImageUrl;
  }
  return url.trim();
}

export async function Hero() {
  const [settings, thresholdCents] = await Promise.all([
    fetchSiteSettings(),
    getFreeShippingThresholdCents(),
  ]);

  const { lead, accent } = splitTagline(settings.heroHeadline);
  const heroImageUrl = resolveHeroImageUrl(settings.heroImageUrl);
  const isRemote = heroImageUrl.startsWith('http');

  return (
    <section className="px-6 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-1 flex flex-col gap-6 lg:order-1">
          <p className="font-body text-xs font-medium uppercase tracking-[0.08em] text-brand-600">
            {settings.heroEyebrow}
          </p>
          <h1 className="text-balance font-display text-5xl leading-[1.04] tracking-[-0.03em] text-warm-900 md:text-6xl lg:text-7xl">
            {lead}
            <em className="italic text-brand-400">{accent}</em>
          </h1>
          <p className="max-w-md font-body text-base leading-relaxed text-warm-600 md:text-lg">
            {settings.heroSubhead}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={settings.heroPrimaryCtaHref}
              className="inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
            >
              {settings.heroPrimaryCtaLabel}
            </Link>
            <Link
              href={settings.heroSecondaryCtaHref}
              className="inline-flex items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
            >
              {settings.heroSecondaryCtaLabel}
            </Link>
          </div>
        </div>

        <div className="order-2 lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-warm-100">
            <Image
              src={heroImageUrl}
              alt="A happy pet enjoying a fresh meal at home"
              fill
              priority
              placeholder="blur"
              blurDataURL={HERO_BLUR}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              unoptimized={isRemote}
            />
            <div className="bg-surface-card/95 absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 shadow-sm backdrop-blur-sm">
              <span
                aria-hidden
                className="inline-flex size-7 items-center justify-center rounded-md bg-brand-50 text-brand-600"
              >
                <Truck size={14} />
              </span>
              <span className="font-body text-sm text-warm-900">
                {formatFreeShippingLabel(thresholdCents)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
