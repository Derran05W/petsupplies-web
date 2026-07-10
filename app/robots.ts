import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@/lib/site/metadata';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/checkout', '/email', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
