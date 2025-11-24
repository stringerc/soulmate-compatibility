import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/partner/'],
      },
    ],
    sitemap: 'https://soulmates.syncscript.app/sitemap.xml',
  }
}

