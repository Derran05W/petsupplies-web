import {
  CategoryRow,
  emphasize,
  Reveal,
  SectionHeader,
  TILE_TONES,
  type PetIconName,
} from '@/components/ui';
import { fetchCategoryStrip } from '@/lib/api/site/category-strip';
import { resolveActiveCategoryStripItems } from '@/lib/site/category-strip-display';
import {
  CATEGORY_STRIP_ICON_PREFIX,
  resolveCategoryStripIconKey,
  type CategoryStripIconKey,
} from '@/lib/site/category-strip-icons';
import { HOME_CONTENT } from '@/lib/site/home-content';

/** Admin strip icon keys → the boutique line-art set (paw covers the rest). */
const PET_ICON_BY_STRIP_KEY: Record<CategoryStripIconKey, PetIconName> = {
  'layout-grid': 'paw',
  dog: 'dog',
  cat: 'cat',
  fish: 'fish',
  bird: 'paw',
  rabbit: 'paw',
  turtle: 'paw',
  'paw-print': 'paw',
};

/**
 * Big-text category list (mockup `.cats`), fed by the admin-managed
 * category strip: label, link, ordering, and photo-vs-icon all come from
 * the console; tones cycle like the mockup's bg-a…bg-d. Keeps the
 * `#categories` anchor the hero's secondary CTA has historically pointed
 * at. Rows sit in one Reveal — CategoryRow draws its own hairlines via
 * sibling `last:` rules, so they must stay direct siblings.
 */
export async function CategoryRows() {
  const items = resolveActiveCategoryStripItems(await fetchCategoryStrip());
  if (items.length === 0) {
    return null;
  }

  const { kicker, heading, rowCta } = HOME_CONTENT.categories;

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="px-gutter py-section"
    >
      <div className="mx-auto max-w-wrap">
        <Reveal>
          <SectionHeader kicker={kicker} headingId="categories-heading">
            {emphasize(heading)}
          </SectionHeader>
        </Reveal>
        <Reveal className="mt-10">
          {items.map((item, index) => {
            const isPhoto =
              typeof item.imageUrl === 'string' &&
              item.imageUrl.length > 0 &&
              !item.imageUrl.startsWith(CATEGORY_STRIP_ICON_PREFIX);
            return (
              <CategoryRow
                key={item.id}
                href={item.href}
                name={item.label}
                count={rowCta}
                icon={PET_ICON_BY_STRIP_KEY[resolveCategoryStripIconKey(item)]}
                imageUrl={isPhoto ? item.imageUrl! : undefined}
                tone={TILE_TONES[index % TILE_TONES.length]}
              />
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
