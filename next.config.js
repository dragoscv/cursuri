// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Setting to false to avoid double rendering in development which can cause performance issues
    reactStrictMode: false,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Don't ignore any TypeScript errors
        ignoreBuildErrors: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
        minimumCacheTTL: 60,
    },
    // Add headers for proper CSP configuration
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://unpkg.com",
                            "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://unpkg.com",
                            "worker-src 'self' blob:",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "img-src 'self' data: https: blob:",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://*.analytics.google.com https://api.stripe.com wss://*.firebaseio.com",
                            "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://js.stripe.com https://hooks.stripe.com",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
}

export default withNextIntl(nextConfig);
