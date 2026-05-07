import { brand } from '@/lib/config/brand';

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="mb-4 font-body text-xs font-medium uppercase tracking-[0.08em] text-brand-600">
          {brand.name}
        </p>
        <h1 className="font-display text-4xl leading-[1.05] tracking-[-0.03em] text-warm-900 md:text-6xl">
          {brand.tagline.replace(/love\.$/, '')}
          <em className="italic text-brand-400">love.</em>
        </h1>
        <p className="mt-6 font-body text-base leading-relaxed text-warm-600 md:text-lg">
          {brand.description}
        </p>
        <p className="mt-12 font-body text-xs uppercase tracking-[0.08em] text-warm-400">
          Phase 1 — design system online
        </p>
      </div>
    </main>
  );
}
