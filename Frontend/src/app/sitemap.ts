import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Note
  const baseUrl = 'https://www.ezqueue.com'

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/th/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/th/booking`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/th/queue-status`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    ...(['en', 'th'] as const).flatMap((locale) => [
      {
        url: `${baseUrl}/${locale}/terms`,
        lastModified: new Date('2026-07-22'),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/${locale}/privacy`,
        lastModified: new Date('2026-07-22'),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
    ]),
  ]
}
