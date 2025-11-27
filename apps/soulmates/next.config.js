/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Default to Phase 3 (all features enabled) since we've implemented them
    // Can be overridden via environment variable for gradual rollout
    SOULMATES_PHASE: process.env.SOULMATES_PHASE || "3",
    NEXT_PUBLIC_SOULMATES_PHASE: process.env.NEXT_PUBLIC_SOULMATES_PHASE || process.env.SOULMATES_PHASE || "3",
  },
  transpilePackages: ['@soulmates/core-domain', '@soulmates/config'],
}

module.exports = nextConfig

