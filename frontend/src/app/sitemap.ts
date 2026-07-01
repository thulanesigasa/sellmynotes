import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sellmynotes.co.za';

  // Add all static routes
  const routes = [
    '',
    '/explore',
    '/pricing',
    '/features',
    '/about',
    '/faq',
    '/contact',
    '/login',
    '/signup',
    '/privacy',
    '/terms',
    '/refund',
    '/shipping',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // In the future, you can also dynamically fetch notes from your database 
  // here and add them to the sitemap array to get individual notes indexed!

  return [...routes];
}
