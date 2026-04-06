import { MetadataRoute } from 'next'
import { siteConfig } from '@/utils/metadata'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            // Bing crawler — critical for ChatGPT Search (uses Bing index)
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            // OpenAI crawlers
            {
                userAgent: 'OAI-SearchBot',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            // Anthropic crawlers
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'Anthropic-AI',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            // Other AI crawlers
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'Google-Extended',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'Bytespider',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'CCBot',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'Cohere-AI',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: 'Meta-ExternalAgent',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
    }
}
