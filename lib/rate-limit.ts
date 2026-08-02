import { createHmac, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'

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
 * The fallback salt, generated once per process.
 *
 * Generated eagerly rather than on first use so it is unconditionally stable:
 * a salt that changed between requests would hash the same address to a
 * different key every time, and the hourly limiter would never recognise a
 * repeat submitter. It is never a hardcoded constant — a known salt over the
 * 2^32 IPv4 space is trivially reversible, which would defeat the entire point
 * of storing a hash rather than an address.
 */
const processSalt = randomBytes(32).toString('hex')

let warnedAboutFallback = false

/**
 * The configured salt, or the per-process fallback.
 *
 * Async because this is now a setting: a value entered in the dashboard has to
 * take effect without a restart. `getSetting` resolves database-then-environment
 * and caches for 30 seconds, so the contact path does not pay for a query per
 * submission.
 *
 * Deliberately resolved per call rather than captured once at module load.
 * Rotating the salt is documented as making existing hashes unrecognisable, so
 * picking up a new value mid-process is the stated behaviour rather than a bug
 * — and caching it here would mean a rotation only took effect on the next
 * deploy, which is precisely the friction this screen exists to remove.
 */
async function resolveSalt() {
  const configured = await getSetting('INQUIRY_IP_SALT')

  if (!configured && !warnedAboutFallback) {
    warnedAboutFallback = true
    console.warn(
      '[rate-limit] No INQUIRY_IP_SALT configured; using a random per-process ' +
        'salt. Source hashes will not correlate across restarts. Set one in ' +
        'the dashboard settings, or in .env, to keep them stable.'
    )
  }

  return configured || processSalt
}

/**
 * Derives a stable, non-reversible key from the client address.
 *
 * The raw IP never leaves this function and is never written to disk, and the
 * hash cannot be inverted back to an address without the salt. HMAC, not a
 * concatenated hash, is what makes that hold: hashing `ip + salt` directly is
 * the wrong primitive for keyed hashing.
 */
export async function hashIp(request: Request) {
  // Traefik terminates TLS and forwards, so the left-most entry is the client.
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''

  return createHmac('sha256', await resolveSalt()).update(ip).digest('hex').slice(0, 16)
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
