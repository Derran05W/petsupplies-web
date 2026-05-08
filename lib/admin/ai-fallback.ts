/**
 * Local AI description generator used when the backend streaming
 * endpoint is unreachable. Emits 60–80 character chunks every 80 ms so
 * the UI can demo the streaming experience identically to the real
 * thing. Six lorem-ipsum-style templates keyed off `${category}_${petType}`
 * with a generic fallback.
 *
 * TODO(phase 8): remove fallback once backend phase 8 streaming endpoint
 * is on staging.
 */
import type { Category, PetType } from '@/types/product';

const TEMPLATES: Record<string, string> = {
  food_dog:
    '{name} is a thoughtfully crafted, vet-formulated meal made for the dogs that mean the most to you. Every ingredient is responsibly sourced and gently cooked to lock in flavour, with a balance of protein, healthy fats, and slow-release carbohydrates that supports steady energy through long walks and lazy afternoons alike. Free from fillers, artificial colours, and the usual suspects most pantries quietly avoid. Resealable pouch, dated for freshness.',
  food_cat:
    '{name} is a single-protein, gently steamed recipe built around what cats actually thrive on: real animal protein, taurine, and a dense, savoury aroma that even fussy eaters lean in for. No grain fillers, no plant-protein shortcuts, no carrageenan. Just the good stuff, balanced for adult cats and kittens alike. Pairs beautifully with our wet-food line for the picky eater in your life.',
  food_bird:
    '{name} is a hand-blended seed and grain mix tuned for active, song-loving birds. Plump millet, sunflower hearts, and small fragments of dried fruit deliver the colour, crunch, and variety that keeps a cage feeling fresh week after week. Easy to digest, gentle on small beaks, and packaged in a resealable pouch that keeps the last scoop tasting as good as the first.',
  'food_small-animal':
    '{name} is a soft, leafy second-cut hay sourced from family farms — every bale hand-checked before it heads out. Ideal for rabbits, guinea pigs, and chinchillas, the long-strand fibre supports digestion and natural foraging. Stored cool and dry, sealed for freshness, and dust-extracted so even the most sensitive little ones can tuck in without a sneeze in sight.',
  treats_dog:
    '{name} is the small reward that turns a so-so training session into a tail-wagging breakthrough. Crunchy on the outside, deeply flavoured all the way through, and sized for clean one-handed delivery — these are the treats trainers reach for first. Single-protein, no artificial preservatives, and gentle enough for daily rotation without overdoing the calories.',
  accessories_dog:
    "{name} is built from materials we'd happily put on our own dogs — soft against the coat, strong against the chew, and beautiful enough to leave on the hook by the door. Hand-finished hardware, machine-washable wherever possible, and sized so you can find the right fit on the first try. The kind of accessory that quietly improves every walk.",
  healthcare_dog:
    '{name} is a vet-formulated daily supplement designed to support joint mobility, a glossy coat, and a settled gut from puppyhood through senior years. Soft-chew texture means it earns its place in the routine without a fight, and the targeted ingredient list keeps active dogs at their best on long walks, agility weekends, and the slow Sunday recoveries that follow.',
};

function pickTemplate(category: Category, petType: PetType): string {
  const key = `${category}_${petType}`;
  return (
    TEMPLATES[key] ??
    TEMPLATES[`${category}_dog`] ??
    `{name} is a thoughtfully chosen pick from the pawsupply catalogue. Every detail — from the materials we source to the finishing touches — is built around the kind of long-term value pet owners actually feel. Designed for daily life, dependable enough to keep up, and made by a team that genuinely cares about getting it right.`
  );
}

interface FallbackOptions {
  name: string;
  category: Category;
  petType: PetType;
  refinement?: string;
  signal?: AbortSignal;
}

const CHUNK_MIN = 60;
const CHUNK_MAX = 80;
const DELAY_MS = 80;

function pseudoChunkSize(seed: number): number {
  return CHUNK_MIN + (seed % (CHUNK_MAX - CHUNK_MIN + 1));
}

/**
 * Yields the fallback description in 60–80 char chunks every 80 ms.
 * Honours the abort signal so cancelling mid-stream resolves the
 * iterator immediately.
 */
export async function* streamFallbackDescription(
  options: FallbackOptions,
): AsyncGenerator<string, void, void> {
  const { name, category, petType, refinement, signal } = options;
  const template = pickTemplate(category, petType).replaceAll('{name}', name);
  const refined =
    refinement && refinement.trim().length > 0
      ? `${template}\n\nRefinement: ${refinement.trim()}.`
      : template;

  let cursor = 0;
  let seed = name.length + petType.length + category.length;
  while (cursor < refined.length) {
    if (signal?.aborted) return;
    const size = pseudoChunkSize(seed);
    seed = (seed + 7) * 17;
    const chunk = refined.slice(cursor, cursor + size);
    cursor += size;
    yield chunk;
    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, DELAY_MS);
      signal?.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
    });
  }
}
