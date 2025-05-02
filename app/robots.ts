import { MetadataRoute } from 'next'
import { siteConfig } from '@/utils/metadata'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/'],
        },
        sitemap: `${siteConfig.url}/sitemap.xml`,
    }
}
