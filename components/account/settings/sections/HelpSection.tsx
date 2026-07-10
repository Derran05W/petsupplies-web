import { brand } from '@/lib/config/brand';

export function HelpSection() {
  return (
    <section
      id="help"
      aria-labelledby="help-heading"
      className="scroll-mt-24 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      <h2
        id="help-heading"
        className="mb-1 font-display text-2xl tracking-[-0.01em] text-ink"
      >
        Help
      </h2>
      <p className="mb-4 font-body text-sm text-ink-secondary">
        Questions about an order, subscription, or product? We&apos;re happy to
        help.
      </p>
      <a
        href={`mailto:${brand.supportEmail}?subject=Help%20request`}
        className="inline-flex rounded-tile border border-line bg-panel px-4 py-3 font-body text-sm font-medium text-ink transition-colors duration-fast hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
      >
        Email {brand.supportEmail}
      </a>
    </section>
  );
}
