/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SOULMATES_PHASE: process.env.SOULMATES_PHASE || "0",
  },
  transpilePackages: ['@soulmates/core-domain', '@soulmates/config'],
}

module.exports = nextConfig

