import { brand } from '@/lib/config/brand';

export function HelpSection() {
  return (
    <section
      id="help"
      aria-labelledby="help-heading"
      className="scroll-mt-24 rounded-2xl border border-warm-200 bg-surface-card p-6 md:p-8"
    >
      <h2
        id="help-heading"
        className="mb-1 font-display text-2xl tracking-[-0.02em] text-warm-900"
      >
        Help
      </h2>
      <p className="mb-4 font-body text-sm text-warm-600">
        Questions about an order, subscription, or product? We&apos;re happy to
        help.
      </p>
      <a
        href={`mailto:${brand.supportEmail}?subject=Help%20request`}
        className="bg-warm-50/40 inline-flex rounded-lg border border-warm-200 px-4 py-3 font-body text-sm font-medium text-brand-700 transition-colors hover:bg-warm-100"
      >
        Email {brand.supportEmail}
      </a>
    </section>
  );
}
