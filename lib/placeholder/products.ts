// TODO(phase 4): replace with backend fetch via lib/api/client.ts
import { type Product } from '@/types/product';

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: 'placeholder-1',
    slug: 'salmon-sweet-potato-recipe',
    name: 'Salmon & Sweet Potato Recipe',
    priceCents: 4200,
    imageUrl: '/images/hero-placeholder.jpg',
    category: 'Dry food',
    petType: 'dog',
  },
  {
    id: 'placeholder-2',
    slug: 'wild-caught-tuna-pate',
    name: 'Wild-Caught Tuna Pâté',
    priceCents: 2800,
    imageUrl: '/images/hero-placeholder.jpg',
    category: 'Wet food',
    petType: 'cat',
  },
  {
    id: 'placeholder-3',
    slug: 'gentle-grain-puppy-formula',
    name: 'Gentle Grain Puppy Formula',
    priceCents: 3600,
    imageUrl: '/images/hero-placeholder.jpg',
    category: 'Puppy',
    petType: 'dog',
  },
  {
    id: 'placeholder-4',
    slug: 'songbird-seed-blend',
    name: 'Songbird Seed Blend',
    priceCents: 1800,
    imageUrl: '/images/hero-placeholder.jpg',
    category: 'Seeds',
    petType: 'bird',
  },
  {
    id: 'placeholder-5',
    slug: 'timothy-hay-bundle',
    name: 'Timothy Hay Bundle',
    priceCents: 2200,
    imageUrl: '/images/hero-placeholder.jpg',
    category: 'Hay',
    petType: 'small-animal',
  },
  {
    id: 'placeholder-6',
    slug: 'salmon-skin-training-treats',
    name: 'Salmon Skin Training Treats',
    priceCents: 1400,
    imageUrl: '/images/hero-placeholder.jpg',
    category: 'Treats',
    petType: 'dog',
  },
];
