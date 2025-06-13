/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['openweathermap.org'],
  },
  // Fixed: Updated to use the new config name
  serverExternalPackages: ['@prisma/client'],
}

module.exports = nextConfig