import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/api/products';
import { resolveSiteUrl } from '@/lib/site/metadata';
import { STATIC_PAGE_SLUGS } from '@/types/site';

// Cap product URLs so a large catalogue can't blow up the sitemap. Sitemaps
// allow up to 50k URLs; ~200 is plenty for this storefront. Revisit (split
// into a sitemap index) if the catalogue ever outgrows this.
const PRODUCT_URL_CAP = 200;
// petsupplies-api silently clamps `limit` to 100, so reaching the cap takes
// paged fetches rather than one oversized request.
const PRODUCT_PAGE_SIZE = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resolveSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/cart`, changeFrequency: 'monthly', priority: 0.3 },
    ...STATIC_PAGE_SLUGS.map((slug) => ({
      url: `${siteUrl}/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ];

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const collected = [];
    let page = 1;
    let totalPages = 1;
    while (collected.length < PRODUCT_URL_CAP && page <= totalPages) {
      const result = await getProducts({ page, pageSize: PRODUCT_PAGE_SIZE });
      collected.push(...result.products);
      totalPages = result.totalPages;
      page += 1;
    }
    productEntries = collected.slice(0, PRODUCT_URL_CAP).map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // API unreachable — still emit the static entries so the sitemap is valid.
    productEntries = [];
  }

  return [...staticEntries, ...productEntries];
}
