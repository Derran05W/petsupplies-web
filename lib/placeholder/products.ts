// TODO(phase 4): remove fallback once backend phase 4 is on staging
import { type Product } from '@/types/product';

/**
 * Local placeholder product catalogue. Used by:
 *  - the homepage `<FeaturedProducts />` list (still wired here in Phase 4),
 *  - the `lib/api/products.ts` fallback path when the backend is unreachable,
 *  - so the frontend renders a fully-functional UI in dev / preview before
 *    backend Phase 4 is on staging.
 *
 * Once the backend is live, delete the fallback in `lib/api/products.ts` and
 * trim this file to whatever is still genuinely placeholder content.
 */

const PLACEHOLDER_IMAGE = '/images/hero-placeholder.jpg';

function img(
  id: string,
  name: string,
  isPrimary = true,
): Product['images'][number] {
  return {
    id,
    url: PLACEHOLDER_IMAGE,
    alt: name,
    isPrimary,
  };
}

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: 'placeholder-1',
    slug: 'salmon-sweet-potato-recipe',
    name: 'Salmon & Sweet Potato Recipe',
    description:
      'Wild-caught salmon paired with sweet potato and pumpkin for an omega-rich meal that supports skin, coat, and digestion. No fillers, no artificial preservatives — ever.',
    priceCents: 4200,
    compareAtPriceCents: 4800,
    category: 'food',
    petType: 'dog',
    images: [
      img('img-1-a', 'Salmon & Sweet Potato Recipe', true),
      img('img-1-b', 'Salmon & Sweet Potato Recipe ingredients', false),
      img('img-1-c', 'Salmon & Sweet Potato Recipe lifestyle', false),
      img('img-1-d', 'Salmon & Sweet Potato Recipe back of bag', false),
    ],
    nutritionalInfo: {
      ingredients:
        'Wild-caught salmon, sweet potato, brown rice, pumpkin, peas, salmon oil, ground flaxseed, mixed tocopherols (preservative).',
      guaranteedAnalysis: [
        { nutrient: 'Crude protein (min)', percentage: '26%' },
        { nutrient: 'Crude fat (min)', percentage: '15%' },
        { nutrient: 'Crude fiber (max)', percentage: '4%' },
        { nutrient: 'Moisture (max)', percentage: '10%' },
      ],
      feedingGuidelines:
        'Adult dogs: feed 1 cup per 20 lbs of body weight, divided into two meals. Adjust based on activity level. Always provide fresh water.',
    },
    inStock: true,
    stockCount: 42,
    tags: ['grain-free', 'salmon', 'omega-3'],
    rating: { avg: 4.7, count: 312 },
    createdAt: '2025-09-12T10:00:00.000Z',
    subscription: {
      enabled: true,
      intervals: ['2_weeks', '4_weeks', '8_weeks', '12_weeks'],
      discountPercent: 10,
    },
  },
  {
    id: 'placeholder-2',
    slug: 'wild-caught-tuna-pate',
    name: 'Wild-Caught Tuna Pâté',
    description:
      'Silky, single-protein pâté made from wild-caught tuna for the most discerning cats. Soft texture, dense aroma, zero grains.',
    priceCents: 2800,
    category: 'food',
    petType: 'cat',
    images: [img('img-2-a', 'Wild-Caught Tuna Pâté', true)],
    nutritionalInfo: {
      ingredients:
        'Wild-caught tuna, fish broth, sunflower oil, taurine, vitamins and minerals.',
      guaranteedAnalysis: [
        { nutrient: 'Crude protein (min)', percentage: '12%' },
        { nutrient: 'Crude fat (min)', percentage: '4%' },
        { nutrient: 'Crude fiber (max)', percentage: '1%' },
        { nutrient: 'Moisture (max)', percentage: '78%' },
      ],
      feedingGuidelines:
        'Adult cats: feed one 3 oz can per 6 lbs of body weight per day, in two or three small meals.',
    },
    inStock: true,
    stockCount: 120,
    tags: ['wet-food', 'single-protein'],
    rating: { avg: 4.9, count: 528 },
    createdAt: '2025-08-30T10:00:00.000Z',
  },
  {
    id: 'placeholder-3',
    slug: 'gentle-grain-puppy-formula',
    name: 'Gentle Grain Puppy Formula',
    description:
      'Slow-cooked oats and chicken for sensitive puppy tummies. DHA from salmon oil supports growing brains and bright eyes.',
    priceCents: 3600,
    category: 'food',
    petType: 'dog',
    images: [img('img-3-a', 'Gentle Grain Puppy Formula', true)],
    inStock: true,
    stockCount: 28,
    tags: ['puppy', 'sensitive-stomach'],
    rating: { avg: 4.5, count: 86 },
    createdAt: '2025-10-04T10:00:00.000Z',
  },
  {
    id: 'placeholder-4',
    slug: 'songbird-seed-blend',
    name: 'Songbird Seed Blend',
    description:
      'A balanced blend of millet, sunflower hearts, and dried fruit. Bright, flavourful, and easy to digest for finches, canaries, and small parrots.',
    priceCents: 1800,
    category: 'food',
    petType: 'bird',
    images: [img('img-4-a', 'Songbird Seed Blend', true)],
    inStock: false,
    stockCount: 0,
    tags: ['seed', 'small-bird'],
    rating: { avg: 4.4, count: 41 },
    createdAt: '2025-07-18T10:00:00.000Z',
  },
  {
    id: 'placeholder-5',
    slug: 'timothy-hay-bundle',
    name: 'Timothy Hay Bundle',
    description:
      'Hand-picked, second-cut Timothy hay — soft, leafy, and perfect for rabbits, guinea pigs, and chinchillas. Resealable bag keeps it fresh.',
    priceCents: 2200,
    category: 'food',
    petType: 'small-animal',
    images: [img('img-5-a', 'Timothy Hay Bundle', true)],
    inStock: true,
    stockCount: 64,
    tags: ['hay', 'fiber'],
    rating: { avg: 4.8, count: 197 },
    createdAt: '2025-09-01T10:00:00.000Z',
  },
  {
    id: 'placeholder-6',
    slug: 'salmon-skin-training-treats',
    name: 'Salmon Skin Training Treats',
    description:
      'Crunchy, single-ingredient salmon skin treats — perfect bite-size rewards for training sessions. Just one ingredient: salmon.',
    priceCents: 1400,
    category: 'treats',
    petType: 'dog',
    images: [img('img-6-a', 'Salmon Skin Training Treats', true)],
    inStock: true,
    stockCount: 200,
    tags: ['training', 'single-ingredient'],
    rating: { avg: 4.9, count: 412 },
    createdAt: '2025-10-15T10:00:00.000Z',
    subscription: {
      enabled: true,
      intervals: ['4_weeks', '8_weeks'],
      discountPercent: 15,
    },
  },
  {
    id: 'placeholder-7',
    slug: 'natural-rope-tug-toy',
    name: 'Natural Rope Tug Toy',
    description:
      'Hand-twisted from organic cotton fibres — strong enough for serious tugging, soft enough on teeth and gums. Machine-washable.',
    priceCents: 1600,
    category: 'accessories',
    petType: 'dog',
    images: [img('img-7-a', 'Natural Rope Tug Toy', true)],
    inStock: true,
    stockCount: 95,
    tags: ['toy', 'organic-cotton'],
    rating: { avg: 4.6, count: 73 },
    createdAt: '2025-06-22T10:00:00.000Z',
  },
  {
    id: 'placeholder-8',
    slug: 'daily-multivitamin-chews',
    name: 'Daily Multivitamin Chews',
    description:
      'Vet-formulated soft chews with glucosamine, omega-3, and probiotics. Supports joints, coat, and gut health — for dogs of all ages.',
    priceCents: 3200,
    compareAtPriceCents: 3800,
    category: 'healthcare',
    petType: 'dog',
    images: [img('img-8-a', 'Daily Multivitamin Chews', true)],
    inStock: true,
    stockCount: 56,
    tags: ['supplement', 'joint', 'probiotic'],
    rating: { avg: 4.7, count: 244 },
    createdAt: '2025-11-01T10:00:00.000Z',
    subscription: {
      enabled: true,
      intervals: ['2_weeks', '4_weeks', '8_weeks'],
      discountPercent: 12,
    },
  },
];
