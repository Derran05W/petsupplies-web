import Link from 'next/link';

interface Category {
  label: string;
  href: string;
}

const CATEGORIES: Category[] = [
  { label: 'All', href: '/products' },
  { label: 'Dogs', href: '/products?pet=dog' },
  { label: 'Cats', href: '/products?pet=cat' },
  { label: 'Birds', href: '/products?pet=bird' },
  { label: 'Small animals', href: '/products?pet=small-animal' },
];

export function CategoryStrip() {
  return (
    <section
      id="categories"
      aria-label="Shop by pet"
      className="px-6 pb-4 pt-4 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <ul
          className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map((cat) => (
            <li key={cat.label} className="snap-start">
              <Link
                href={cat.href}
                className="inline-flex shrink-0 items-center rounded-md border border-warm-200 bg-white px-3.5 py-2 font-body text-sm text-warm-900 transition-colors hover:border-warm-300 hover:bg-warm-100"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
