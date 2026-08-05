/**
 * Response headers applied to every route.
 *
 * The deliberate omission is `script-src` / `style-src`. Next inlines its own
 * bootstrap script and Motion writes inline styles per frame, so a strict
 * policy needs either `'unsafe-inline'` — which is most of the protection gone
 * — or a per-request nonce threaded through middleware. A nonce is the right
 * answer and it is a change that has to be verified in a real browser; adding
 * it blind would mean shipping a policy that either does nothing or breaks
 * every page. The directives below are the ones that are safe to assert
 * without that verification, and each closes a real hole.
 */
const securityHeaders = [
  // Stops a browser second-guessing Content-Type. The upload-free surface here
  // is small, but /api/whisper accepts audio and this costs nothing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Send the full URL within the site, only the origin when leaving it. The
  // case-study paths are not secret, but there is no reason for an outbound
  // click to tell a third party which project referred it.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Clickjacking. X-Frame-Options for older agents, frame-ancestors for the
  // rest — the admin dashboard is the thing worth framing, and it should never
  // be embedded anywhere.
  { key: 'X-Frame-Options', value: 'DENY' },

  {
    key: 'Content-Security-Policy',
    value: [
      "frame-ancestors 'none'",
      // A dangling <base> injected into a page could re-point every relative
      // URL, including the admin form actions.
      "base-uri 'self'",
      "object-src 'none'",
      // The contact form and the login form both post same-origin. Nothing on
      // this site should ever submit anywhere else.
      "form-action 'self'",
    ].join('; '),
  },

  {
    key: 'Permissions-Policy',
    // `microphone=(self)` is not boilerplate: /admin/dashboard uses the
    // MediaRecorder API for the Whisper transcription field. Denying it here
    // would silently break a working feature. Everything else is off.
    value: [
      'microphone=(self)',
      'camera=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'interest-cohort=()',
    ].join(', '),
  },

  {
    key: 'Strict-Transport-Security',
    // Public traffic arrives over HTTPS via Cloudflare Tunnel. Browsers ignore
    // this header on a plain-HTTP response, so it is inert for local work.
    // No `preload`: that is a one-way door and belongs to whoever owns the
    // apex domain, not to this app.
    value: 'max-age=31536000; includeSubDomains',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the Docker image small (see Dockerfile).
  output: 'standalone',

  // Removes `X-Powered-By: Next.js`. Version-fingerprinting a public server is
  // free reconnaissance and the header serves nobody.
  poweredByHeader: false,

  experimental: {
    // Keeps Prisma out of the webpack bundle so its query engine binary is
    // traced and shipped correctly into the serverless function.
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },

  images: {
    /**
     * A hostname on this list is a standing instruction to fetch, transcode and
     * cache anything under it on request, from any visitor. Measured against
     * production before narrowing it:
     *
     *   /_next/image?url=https://raw.githubusercontent.com/github/explore/…png
     *   -> 200, 1087 bytes
     *
     * That is an arbitrary third-party file pulled through this server and
     * written to its disk, and nothing bounds how many distinct URLs an
     * attacker may ask for — the concrete form of the "unbounded next/image
     * disk cache growth" and Image Optimizer DoS advisories open against
     * Next 14, on a box where the disk is shared with Postgres.
     *
     * `pathname` scopes the one host that has a plausible use to this account.
     * The other two are gone: nothing references them, and neither
     * user-images.githubusercontent.com (numeric upload paths) nor i.imgur.com
     * (opaque IDs) can be scoped to an owner at all, so each was an open image
     * proxy kept for a feature that does not exist. `repoPrefill` deliberately
     * never sets `image`, and both project images on the site are local files.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/medo94my/**',
      },
    ],
    // A day, rather than the 60-second default. Each (url, width, quality) is a
    // separate cache entry revalidated on expiry, so a short TTL multiplies
    // upstream fetches for images that are content-addressed anyway.
    minimumCacheTTL: 86400,
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
