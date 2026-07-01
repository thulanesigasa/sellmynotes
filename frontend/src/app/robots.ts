import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/seller', '/library', '/upload', '/wishlist', '/profile', '/admin'],
    },
    sitemap: 'https://sellmynotes.co.za/sitemap.xml',
  };
}
