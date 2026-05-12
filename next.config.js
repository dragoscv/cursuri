// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';
import { execSync } from 'node:child_process';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * Derive a short, human-readable build identifier with zero configuration.
 *
 * Priority:
 *   1. Vercel deployments — `VERCEL_GIT_COMMIT_SHA` is auto-injected by Vercel
 *      at build time on every deployment. No project setting required.
 *   2. Self-hosted / CI — `npm_package_version` from package.json.
 *   3. Local dev — `git rev-parse --short HEAD`.
 *   4. Last resort — `'dev'`.
 *
 * Inlined at build time via `env`, so it ships as a constant string in the
 * client bundle and has no runtime cost.
 */
function resolveAppVersion() {
    const sha = process.env.VERCEL_GIT_COMMIT_SHA;
    if (sha) return sha.slice(0, 7);

    const pkgVersion = process.env.npm_package_version;
    if (pkgVersion) return `v${pkgVersion}`;

    try {
        return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString()
            .trim();
    } catch {
        return 'dev';
    }
}

const APP_VERSION = resolveAppVersion();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Setting to false to avoid double rendering in development which can cause performance issues
    reactStrictMode: false,
    env: {
        // Exposed to the browser as `process.env.NEXT_PUBLIC_APP_VERSION`.
        // Consumed by components/shared/DebugErrorPanel.tsx and Sentry tags.
        NEXT_PUBLIC_APP_VERSION: APP_VERSION,
    },
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
    serverExternalPackages: [
        'jsdom',
        'dompurify',
        'isomorphic-dompurify',
        'fluent-ffmpeg',
        'ffmpeg-static',
        '@ffmpeg-installer/ffmpeg',
        'microsoft-cognitiveservices-speech-sdk',
        'firebase-admin',
    ],

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
