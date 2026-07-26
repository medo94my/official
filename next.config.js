/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the Docker image small (see Dockerfile).
  output: 'standalone',

  experimental: {
    // Keeps Prisma out of the webpack bundle so its query engine binary is
    // traced and shipped correctly into the serverless function.
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'user-images.githubusercontent.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
    ],
  },
}

module.exports = nextConfig
