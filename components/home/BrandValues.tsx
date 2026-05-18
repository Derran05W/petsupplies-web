import { Truck, Stethoscope, type LucideIcon } from 'lucide-react';

interface BrandValue {
  Icon: LucideIcon;
  title: string;
  subtext: string;
}

const VALUES: BrandValue[] = [
  {
    Icon: Truck,
    title: 'Free shipping',
    subtext: 'On every order over $50, anywhere in the country.',
  },
  {
    Icon: Stethoscope,
    title: 'Vet approved',
    subtext: 'Recipes formulated alongside practising veterinarians.',
  },
  // {
  //   Icon: Undo2,
  //   title: 'Easy returns',
  //   subtext: "30-day no-questions returns if your pet isn\u2019t loving it.",
  // },
];

export function BrandValues() {
  return (
    <section
      aria-label="Why shop with us"
      className="border-y border-warm-200 bg-warm-100/60"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3 md:px-8 md:py-16 lg:px-12">
        {VALUES.map(({ Icon, title, subtext }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon size={18} aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-xl tracking-[-0.02em] text-warm-900">
                {title}
              </h3>
              <p className="mt-1 font-body text-sm leading-relaxed text-warm-600">
                {subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
