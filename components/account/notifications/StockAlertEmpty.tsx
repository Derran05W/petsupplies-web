import { Button } from '@/components/ui';

export function StockAlertEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-line bg-paper px-6 py-14 text-center">
      <p className="font-display text-2xl tracking-[-0.01em] text-ink">
        No alerts yet
      </p>
      <p className="mt-2 max-w-md font-body text-sm leading-body text-ink-secondary">
        When an item you love is out of stock, tap &quot;Notify me when
        back&quot; on its product page. We&apos;ll email you here.
      </p>
      <Button variant="ghost" href="/products" className="mt-6 px-6 py-2.5">
        Browse products
      </Button>
    </div>
  );
}
