import { randomBytes } from 'crypto'

/**
 * What may be uploaded, and what it is stored as.
 *
 * This is the security boundary for the only endpoint on the site that writes
 * attacker-influenced bytes to disk, so it is pure and separately tested rather
 * than inlined into the route.
 *
 * Three rules carry the weight:
 *
 * 1. **The type is decided by the bytes, not the browser.** A `Content-Type` on
 *    a multipart part is a claim by whoever made the request. `sniffKind` reads
 *    the actual file header.
 * 2. **SVG is never accepted.** It is a script container: an `<svg>` with an
 *    `onload` served from this origin is stored XSS against the admin session.
 *    It is not in the table below and there is no branch that could add it.
 * 3. **No part of the stored path comes from the request.** The name is built
 *    from a slug the server already holds plus random bytes, with the extension
 *    taken from the sniffed type. Path traversal is not filtered, it is
 *    impossible — there is no user string in the path to filter.
 */

export type MediaKind = 'image' | 'video'

export type MediaType = {
  /** Canonical extension, and the only one ever written. */
  ext: string
  mime: string
  kind: MediaKind
  /** Bytes at offset 0 unless `offset` says otherwise. */
  magic: number[]
  offset?: number
  /** Additional bytes that must also match, for container formats. */
  also?: { offset: number; bytes: number[] }
}

/** ASCII helper, so the tables below read as the spec does. */
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0))

export const MEDIA_TYPES: MediaType[] = [
  { ext: 'png', mime: 'image/png', kind: 'image', magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: 'jpg', mime: 'image/jpeg', kind: 'image', magic: [0xff, 0xd8, 0xff] },
  // RIFF....WEBP — the four size bytes between the two markers are skipped.
  { ext: 'webp', mime: 'image/webp', kind: 'image', magic: ascii('RIFF'), also: { offset: 8, bytes: ascii('WEBP') } },
  // EBML header. Also matches .mkv, which is the same container; the browser
  // decides whether it can play the codecs inside, and refusing here would
  // reject perfectly good VP9 recordings.
  { ext: 'webm', mime: 'video/webm', kind: 'video', magic: [0x1a, 0x45, 0xdf, 0xa3] },
  // ISO base media: 'ftyp' at offset 4. The brand that follows varies
  // (isom, mp42, avc1, qt), so it is not checked.
  { ext: 'mp4', mime: 'video/mp4', kind: 'video', magic: ascii('ftyp'), offset: 4 },
]

/** Caps, in bytes. A clip is meant to be a loop, not a film. */
export const MAX_BYTES: Record<MediaKind, number> = {
  image: 5 * 1024 * 1024,
  video: 25 * 1024 * 1024,
}

function matches(header: Uint8Array, type: MediaType) {
  const at = type.offset ?? 0
  for (let i = 0; i < type.magic.length; i++) {
    if (header[at + i] !== type.magic[i]) return false
  }
  if (type.also) {
    for (let i = 0; i < type.also.bytes.length; i++) {
      if (header[type.also.offset + i] !== type.also.bytes[i]) return false
    }
  }
  return true
}

/**
 * The real type of a file, or null if it is not one we accept.
 *
 * Only the first 16 bytes are needed, so the caller can sniff before committing
 * the whole body to memory.
 */
export function sniffMedia(header: Uint8Array): MediaType | null {
  return MEDIA_TYPES.find((type) => matches(header, type)) ?? null
}

export type MediaRejection = { ok: false; reason: string }
export type MediaAcceptance = { ok: true; type: MediaType }

/**
 * Whether these bytes may be stored.
 *
 * `declaredType` is accepted only to be *contradicted* — when the browser says
 * PNG and the bytes say something else, saying so is far more useful than a
 * bare "unsupported file".
 */
export function checkMedia(
  header: Uint8Array,
  size: number,
  declaredType?: string
): MediaAcceptance | MediaRejection {
  if (size === 0) return { ok: false, reason: 'That file is empty.' }

  const type = sniffMedia(header)
  if (!type) {
    const claimed = declaredType?.trim()
    if (claimed?.toLowerCase().includes('svg')) {
      return {
        ok: false,
        reason:
          'SVG cannot be uploaded. It can carry script, and serving one from this domain would let it run against your admin session. Export it as PNG or WebP.',
      }
    }
    return {
      ok: false,
      reason: claimed
        ? `That is not a file type this accepts. The browser called it ${claimed}, but the contents are not PNG, JPEG, WebP, MP4 or WebM.`
        : 'That is not a file type this accepts. Use PNG, JPEG, WebP, MP4 or WebM.',
    }
  }

  const cap = MAX_BYTES[type.kind]
  if (size > cap) {
    return {
      ok: false,
      reason: `That ${type.kind} is ${formatBytes(size)}. The limit is ${formatBytes(cap)} — ${
        type.kind === 'video'
          ? 'a showcase clip should be ten to fifteen seconds and silent'
          : 'export it at a smaller size or as WebP'
      }.`,
    }
  }

  return { ok: true, type }
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

/**
 * The stored filename.
 *
 * The slug is reduced to `[a-z0-9-]` and truncated before use — it comes from
 * the database rather than the request, but treating it as trusted would mean
 * this function's safety depended on a caller two layers away. The random
 * suffix means re-uploading the same screenshot never collides with, or
 * silently replaces, the previous one.
 */
export function mediaFilename(slug: string, ext: string) {
  const safe =
    slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'media'
  return `${safe}-${randomBytes(6).toString('hex')}.${ext}`
}

/** Content types for the streaming route, keyed by the extensions we write. */
export const CONTENT_TYPES: Record<string, string> = Object.fromEntries(
  MEDIA_TYPES.map((t) => [t.ext, t.mime])
)

/**
 * A stored filename, or null.
 *
 * The serving route takes its path from the URL, so this is where traversal is
 * stopped: the name must look exactly like something `mediaFilename` produced.
 * Anything with a slash, a dot-segment, or an extension outside the table is
 * refused before it can reach the filesystem.
 */
export function safeMediaName(name: string): string | null {
  if (!/^[a-z0-9-]{1,60}\.[a-z0-9]{2,5}$/.test(name)) return null
  const ext = name.slice(name.lastIndexOf('.') + 1)
  return CONTENT_TYPES[ext] ? name : null
}
