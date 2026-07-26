/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the Docker image small (see Dockerfile).
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'user-images.githubusercontent.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
    ],
  },
}

module.exports = nextConfig
