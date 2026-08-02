import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

/**
 * Encryption at rest for the secrets stored in the Setting table.
 *
 * The point of the settings screen is that an API key can be changed without
 * SSHing into the host. The cost of that convenience is that the key now lives
 * in Postgres, which means it lives in every `pg_dump`, in the `pgdata` volume,
 * and in any backup that ever gets copied somewhere less careful than the host.
 * Storing it as plain text would make the settings screen a downgrade in
 * security dressed up as an improvement.
 *
 * So one secret stays in the environment — `SETTINGS_KEY` — and everything the
 * screen writes is encrypted with it. That is a real reduction in what has to
 * be managed by hand (one value instead of six) rather than the illusion of
 * one, and it means a leaked database dump yields ciphertext.
 *
 * AES-256-GCM, not CBC: GCM authenticates, so a tampered row fails to decrypt
 * instead of silently producing a different key. Anyone who can write to the
 * database can already do worse, but a corrupted value should announce itself
 * rather than be handed to Resend as an API key.
 */

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12
const TAG_BYTES = 16

/**
 * Whether encryption is available at all.
 *
 * Checked before offering to store a secret rather than after, so the settings
 * screen can disable those fields and say why. Writing a secret in plain text
 * because the key happened to be missing is exactly the silent downgrade this
 * module exists to prevent.
 */
export function isEncryptionConfigured() {
  return Boolean(process.env.SETTINGS_KEY?.trim())
}

/**
 * Derives the 32-byte AES key from whatever `SETTINGS_KEY` contains.
 *
 * SHA-256 of the raw value, so any length of input works and the operator is
 * not required to supply exactly 32 bytes of base64. This is a key-derivation
 * convenience, not password hashing — `SETTINGS_KEY` is expected to be
 * high-entropy machine-generated (`openssl rand -hex 32`), so the cost factor a
 * KDF like scrypt would add buys nothing against an attacker who already holds
 * the ciphertext and would be brute-forcing 256 bits.
 */
function keyBytes() {
  const configured = process.env.SETTINGS_KEY?.trim()
  if (!configured) {
    // Reached only if a caller skipped isEncryptionConfigured(). Throwing beats
    // returning a constant-derived key, which would encrypt everything under a
    // value an attacker could reproduce.
    throw new Error('SETTINGS_KEY is not set; cannot encrypt or decrypt settings')
  }
  return createHash('sha256').update(configured).digest()
}

/**
 * Encrypts a value for storage.
 *
 * Output is `v1.<iv>.<authTag>.<ciphertext>`, all base64url. The version prefix
 * is there so a future change of algorithm can be detected and migrated rather
 * than failing as corruption — without it, old rows and new rows are
 * indistinguishable until one of them throws.
 */
export function encryptSecret(plaintext: string) {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, keyBytes(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.')
}

/**
 * Reverses `encryptSecret`.
 *
 * Returns null rather than throwing on anything malformed. A settings row that
 * cannot be decrypted — because `SETTINGS_KEY` was rotated, or the row predates
 * this format — should degrade to "this setting is not configured", which the
 * caller already handles by falling back to the environment variable. Throwing
 * would take down the contact form because a GitHub token could not be read.
 */
export function decryptSecret(stored: string): string | null {
  try {
    const [version, ivPart, tagPart, dataPart] = stored.split('.')
    if (version !== 'v1' || !ivPart || !tagPart || !dataPart) return null

    const decipher = createDecipheriv(
      ALGORITHM,
      keyBytes(),
      Buffer.from(ivPart, 'base64url')
    )
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))

    return Buffer.concat([
      decipher.update(Buffer.from(dataPart, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    // Covers a rotated key (auth tag mismatch), a truncated row, and a missing
    // SETTINGS_KEY. All three mean the same thing to every caller.
    return null
  }
}

/**
 * The only representation of a secret that may reach the browser.
 *
 * The settings form never receives a plaintext value back — it shows that a
 * key is present and enough of it to recognise which key, then accepts a
 * replacement. Anything more would put every API key into the HTML of a page,
 * into the browser cache, and into any screenshot of that screen.
 */
export function maskSecret(value: string) {
  const trimmed = value.trim()
  if (trimmed.length <= 4) return '••••'
  return `••••${trimmed.slice(-4)}`
}
