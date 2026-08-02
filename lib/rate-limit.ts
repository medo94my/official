import { createHmac, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

/**
 * Two-layer rate limiting, without adding Redis.
 *
 * Layer 1 is an in-memory burst guard. It is allowed to be lossy — it resets
 * whenever the container restarts, which is precisely why it cannot be the
 * real limit: this app restarts on every deploy and under
 * `restart: unless-stopped`, and restarting is exactly what you would do while
 * being flooded.
 *
 * Layer 2 counts existing rows in the table the request is about to write to.
 * It costs one indexed query over a local Docker network, survives restarts,
 * needs no new schema, and leaves the evidence sitting in the admin inbox
 * where it can be looked at.
 */

const BURST_LIMIT = 5
const BURST_WINDOW_MS = 60_000
/** Bounded so a flood of unique keys cannot grow the map without limit. */
const BURST_MAX_KEYS = 500

const HOURLY_LIMIT = 3
const HOURLY_WINDOW_MS = 60 * 60 * 1000

const hits = new Map<string, number[]>()

/**
 * Resolved once at module load, not per request, since a fallback random salt
 * has to stay the same for the life of the process or every request would hash
 * to a different key and the limiter would never see a repeat submitter.
 *
 * `docker-compose.yml` declares this variable as `${INQUIRY_IP_SALT:-}`, which
 * evaluates to an empty string when unset — falsy, but not `undefined`, so a
 * plain `||` fallback is not enough to catch it. `.trim()` also treats
 * whitespace-only values as absent.
 */
const configuredSalt = process.env.INQUIRY_IP_SALT?.trim()

if (!configuredSalt) {
  console.warn(
    '[rate-limit] INQUIRY_IP_SALT is unset; using a random per-process salt. ' +
      'Source hashes will not correlate across restarts. Set INQUIRY_IP_SALT ' +
      '(e.g. `openssl rand -hex 32`) to keep them stable.'
  )
}

const salt = configuredSalt || randomBytes(32).toString('hex')

/**
 * Derives a stable, non-reversible key from the client address.
 *
 * The raw IP never leaves this function and is never written to disk, and the
 * hash cannot be inverted back to an address without the salt. HMAC, not a
 * concatenated hash, is what makes that hold: hashing `ip + salt` directly is
 * vulnerable to length-extension and is simply the wrong primitive for keyed
 * hashing.
 */
export function hashIp(request: Request) {
  // Traefik terminates TLS and forwards, so the left-most entry is the client.
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''

  return createHmac('sha256', salt).update(ip).digest('hex').slice(0, 16)
}

/** In-memory burst check. Returns false when the caller should be rejected. */
function withinBurst(key: string) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < BURST_WINDOW_MS)

  if (recent.length >= BURST_LIMIT) {
    hits.set(key, recent)
    return false
  }

  recent.push(now)
  hits.set(key, recent)

  // Evict the oldest keys rather than letting the map grow unbounded.
  if (hits.size > BURST_MAX_KEYS) {
    const oldest = [...hits.entries()]
      .sort((a, b) => (a[1].at(-1) ?? 0) - (b[1].at(-1) ?? 0))
      .slice(0, hits.size - BURST_MAX_KEYS)
    for (const [k] of oldest) hits.delete(k)
  }

  return true
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }

export async function checkInquiryRateLimit(ipHash: string): Promise<RateLimitResult> {
  if (!withinBurst(ipHash)) {
    return { allowed: false, retryAfterSeconds: 60 }
  }

  const since = new Date(Date.now() - HOURLY_WINDOW_MS)
  const recent = await prisma.inquiry.count({
    where: { ipHash, createdAt: { gt: since } },
  })

  if (recent >= HOURLY_LIMIT) {
    return { allowed: false, retryAfterSeconds: 3600 }
  }

  return { allowed: true }
}
