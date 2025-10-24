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
    // CSP is now managed centrally in middleware.ts
    // This avoids duplication and makes it easier to maintain
    
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
