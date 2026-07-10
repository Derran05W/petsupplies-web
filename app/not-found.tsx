import type { Metadata } from 'next';
import { Button, PetIcon, TONE_CLASSES } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-paper px-gutter py-24 text-center text-ink">
      <span
        aria-hidden
        className={`inline-flex size-16 items-center justify-center rounded-tile ${TONE_CLASSES.amber}`}
      >
        <PetIcon name="paw" className="size-10" />
      </span>
      <p className="mt-8 font-body text-kicker uppercase text-pine">
        Error 404
      </p>
      <h1 className="mt-4 max-w-[16ch] font-display text-display-xl text-ink [&_em]:font-medium [&_em]:italic">
        This page went <em>walkies</em>.
      </h1>
      <p className="mt-6 max-w-[46ch] font-body text-lede leading-body text-ink-secondary">
        We couldn&apos;t fetch the page you were looking for. It may have moved,
        sold out, or never existed.
      </p>
      <div className="mt-10">
        <Button href="/products">Back to shop</Button>
      </div>
    </main>
  );
}
