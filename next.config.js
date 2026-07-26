/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is for the Docker image only. Netlify's Next runtime
  // manages its own output, so leave it alone there.
  output: process.env.NETLIFY ? undefined : 'standalone',

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
