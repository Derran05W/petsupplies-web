import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/api/products';
import { resolveSiteUrl } from '@/lib/site/metadata';
import { STATIC_PAGE_SLUGS } from '@/types/site';

// Cap product URLs so a large catalogue can't blow up the sitemap. Sitemaps
// allow up to 50k URLs; ~200 is plenty for this storefront and keeps the
// single fetch cheap. Revisit (split into a sitemap index) if the catalogue
// ever outgrows this.
const PRODUCT_URL_CAP = 200;

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
    const { products } = await getProducts({ pageSize: PRODUCT_URL_CAP });
    productEntries = products.slice(0, PRODUCT_URL_CAP).map((product) => ({
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
