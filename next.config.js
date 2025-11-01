// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Setting to false to avoid double rendering in development which can cause performance issues
    reactStrictMode: false,
    // Note: eslint config removed from next.config.js as it's deprecated in Next.js 16
    // Use 'next lint' command or eslint.config.js instead
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
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    // Performance optimizations
    poweredByHeader: false,
    compress: true,
    // CSP is now managed centrally in middleware.ts
    // This avoids duplication and makes it easier to maintain

    // Exclude jsdom and dompurify from server bundling to avoid version conflicts
    serverExternalPackages: ['jsdom', 'dompurify', 'isomorphic-dompurify'],

    // Webpack configuration to fix Windows temp directory permission issues
    webpack: (config, { isServer }) => {
        // Exclude Windows temp directories from file watching
        if (!isServer) {
            config.watchOptions = {
                ...config.watchOptions,
                ignored: [
                    '**/node_modules/**',
                    '**/.git/**',
                    '**/.next/**',
                    '**/C:/Users/**/AppData/Local/Temp/**',
                    '**/AppData/Local/Temp/**',
                ],
            };
        }

        // Add fallback for node modules that might not be available in browser
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };

        return config;
    },
}

export default withNextIntl(nextConfig);
