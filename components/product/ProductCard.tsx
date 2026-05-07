import Image from 'next/image';
import Link from 'next/link';
import { type Product } from '@/types/product';
import { formatPrice } from '@/lib/utils/format';

type ProductCardProps = Pick<
  Product,
  'name' | 'slug' | 'priceCents' | 'imageUrl' | 'category' | 'petType'
>;

const PET_LABEL: Record<Product['petType'], string> = {
  dog: 'Dogs',
  cat: 'Cats',
  bird: 'Birds',
  'small-animal': 'Small animals',
};

export function ProductCard({
  name,
  slug,
  priceCents,
  imageUrl,
  category,
  petType,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col rounded-xl border border-warm-200 bg-white p-3 transition-all duration-200 hover:border-warm-300 hover:shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-warm-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-4 flex flex-col gap-2 px-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-brand-50 px-2.5 py-1 font-body text-xs font-medium text-brand-600">
            {category}
          </span>
          <span className="font-body text-xs text-warm-400">
            {PET_LABEL[petType]}
          </span>
        </div>
        <h3 className="font-display text-lg leading-snug tracking-[-0.02em] text-warm-900">
          {name}
        </h3>
        <p className="mt-auto font-body text-sm font-medium text-warm-900">
          {formatPrice(priceCents)}
        </p>
      </div>
    </Link>
  );
}
