import { brand } from '@/lib/config/brand';

export function PrivacySection() {
  return (
    <section
      id="privacy"
      aria-labelledby="privacy-heading"
      className="scroll-mt-24 rounded-2xl border border-warm-200 bg-surface-card p-6 md:p-8"
    >
      <h2
        id="privacy-heading"
        className="mb-1 font-display text-2xl tracking-[-0.02em] text-warm-900"
      >
        Privacy & data
      </h2>
      <p className="mb-6 font-body text-sm text-warm-600">
        Marketing preferences live under Notifications. For a copy of your data
        or other privacy requests, email our team.
      </p>
      <a
        href={`mailto:${brand.supportEmail}?subject=Data%20request`}
        className="bg-warm-50/40 inline-flex rounded-lg border border-warm-200 px-4 py-3 font-body text-sm font-medium text-brand-700 transition-colors hover:bg-warm-100"
      >
        Request my data ({brand.supportEmail})
      </a>
    </section>
  );
}
