import Link from 'next/link';

export function StockAlertEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-warm-200 bg-surface-card px-6 py-14 text-center">
      <p className="font-body text-sm font-medium text-warm-900">
        No alerts yet
      </p>
      <p className="mt-2 max-w-md font-body text-sm text-warm-600">
        When an item you love is out of stock, tap &quot;Notify me when
        back&quot; on its product page. We&apos;ll email you here.
      </p>
      <Link
        href="/products"
        className="mt-6 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
      >
        Browse products
      </Link>
    </div>
  );
}
