/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Default to Phase 3 (all features enabled) since we've implemented them
    // Can be overridden via environment variable for gradual rollout
    SOULMATES_PHASE: process.env.SOULMATES_PHASE || "3",
    NEXT_PUBLIC_SOULMATES_PHASE: process.env.NEXT_PUBLIC_SOULMATES_PHASE || process.env.SOULMATES_PHASE || "3",
    // Disable Vercel Analytics to prevent instrument.js warnings
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || "",
  },
  transpilePackages: ['@soulmates/core-domain', '@soulmates/config'],
  // Headers to prevent Vercel Analytics injection
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Vercel-Analytics',
            value: 'disabled',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

