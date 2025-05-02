/** @type {import('next').NextConfig} */
const nextConfig = {
    // Setting to false to avoid double rendering in development which can cause performance issues
    reactStrictMode: false,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    }, typescript: {
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
}

module.exports = nextConfig
