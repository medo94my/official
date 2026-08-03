import { prisma } from '@/lib/prisma'
import {
  decryptSecret,
  encryptSecret,
  isEncryptionConfigured,
  maskSecret,
} from '@/lib/crypto'

/**
 * Application configuration, editable from the dashboard.
 *
 * Server-only. Nothing here may be imported into a client component: the
 * resolver returns plaintext secrets, and the whole design depends on those
 * never crossing to the browser. The settings API sends a masked status view
 * instead — see `getSettingsStatus`.
 *
 * ## Resolution order
 *
 * A database row wins over the environment variable of the same name, and the
 * environment variable is the fallback. That ordering is the one that makes the
 * screen trustworthy: an operator who types a key into the form expects it to
 * take effect, and a rule where a forgotten .env entry silently overrode it
 * would be maddening to debug. The environment stays as bootstrap — it is what
 * gets the container running before anyone can log in to configure anything —
 * and the UI shows which source is actually in effect so the precedence is
 * never a guess.
 *
 * ## What cannot live here, and why
 *
 * - `DATABASE_URL` — needed to read this table.
 * - `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — validate the session that guards the
 *   page that would edit them. Moving them creates a lockout you cannot
 *   recover from through the UI.
 * - `NEXT_PUBLIC_SITE_URL` — inlined into the client bundle at build time, so a
 *   runtime value would not reach the code that uses it.
 * - `SETTINGS_KEY` — encrypts everything here. Storing it here is circular.
 * - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seed-time only. The password is changed
 *   through the account form, which writes a bcrypt hash to the User row; the
 *   env var is only read by `lib/migrate-old-data.ts` on a fresh install.
 */

export type SettingGroup = 'email' | 'integrations' | 'privacy' | 'models'

export type SettingDefinition = {
  key: string
  label: string
  group: SettingGroup
  /** Encrypted at rest and never returned in full to the browser. */
  secret: boolean
  /** Shown under the field. Explains what breaks without it. */
  help: string
  placeholder?: string
  /**
   * Changing this has a consequence that is not obvious and not reversible,
   * so the UI requires a second confirmation.
   */
  danger?: string
  /**
   * Renders as a model dropdown fed by /api/models?role=… rather than a text
   * input.
   *
   * A bare string, not the `ModelRole` union, on purpose: `lib/openrouter.ts`
   * imports this module for `getSetting`, so importing its types back here
   * would be a cycle. The roles are declared there and reference these keys;
   * this field is only the UI hint that points at them.
   */
  modelRole?: string
}

export const SETTINGS: SettingDefinition[] = [
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API key',
    group: 'email',
    secret: true,
    placeholder: 're_…',
    help: 'Enables the email notification when someone uses the contact form. Without it messages are still saved and readable in the inbox — only the email is skipped.',
  },
  {
    key: 'INQUIRY_NOTIFY_TO',
    label: 'Send notifications to',
    group: 'email',
    secret: false,
    placeholder: 'you@example.com',
    help: 'Where contact-form notifications are delivered. Your real inbox.',
  },
  {
    key: 'INQUIRY_NOTIFY_FROM',
    label: 'Send notifications from',
    group: 'email',
    secret: false,
    placeholder: 'portfolio@yourdomain.com',
    help: 'Must be on a domain you have verified in Resend. An unverified domain fails at their end, silently, after the message has already been saved.',
  },
  {
    key: 'GITHUB_TOKEN',
    label: 'GitHub token',
    group: 'integrations',
    secret: true,
    placeholder: 'ghp_… or github_pat_…',
    help: 'Lets the project importer list your repositories, including private ones, and raises the rate limit from 60 to 5,000 requests an hour. A fine-grained token needs Repository permissions → Metadata: read, or every call is refused.',
  },
  {
    key: 'OPENROUTER_API_KEY',
    label: 'OpenRouter API key',
    group: 'models',
    secret: true,
    placeholder: 'sk-or-v1-…',
    help: 'One key for every model provider. Powers case-study drafting and the voice button. Without it both report the feature is unavailable; nothing else changes.',
  },
  {
    key: 'MODEL_TEXT',
    label: 'Text model',
    group: 'models',
    secret: false,
    modelRole: 'text',
    help: 'Drafts case-study fields from a repository and rewrites voice transcriptions.',
  },
  {
    key: 'MODEL_STT',
    label: 'Speech-to-text model',
    group: 'models',
    secret: false,
    modelRole: 'stt',
    help: 'Transcribes the voice button. These are multimodal chat models that accept audio, not dedicated transcription endpoints.',
  },
  {
    key: 'MODEL_TTS',
    label: 'Text-to-speech model',
    group: 'models',
    secret: false,
    modelRole: 'tts',
    help: 'Nothing uses this yet — set it now and it is ready when something does. Music generators are filtered out of the list.',
  },
  {
    key: 'MODEL_IMAGE',
    label: 'Image model',
    group: 'models',
    secret: false,
    modelRole: 'image',
    help: 'Nothing uses this yet. Generating a screenshot of a real project would misrepresent it, so the plausible use is social-card artwork rather than project imagery.',
  },
  {
    key: 'INQUIRY_IP_SALT',
    label: 'Contact form source salt',
    group: 'privacy',
    secret: true,
    help: 'Salts the one-way hash stored against each contact message, so repeat senders can be recognised without their IP address ever being written down.',
    danger:
      'Changing this makes every source hash already stored unrecognisable — existing messages keep their old hash, and the same sender will look like a new one from now on. It cannot be undone by changing it back unless you have the previous value.',
  },
]

export const SETTING_KEYS = SETTINGS.map((s) => s.key)

const BY_KEY = new Map(SETTINGS.map((s) => [s.key, s]))

/** Whether a key is one this module is allowed to touch. */
export function isKnownSetting(key: string) {
  return BY_KEY.has(key)
}

/**
 * Cached resolved values.
 *
 * `getSetting` is called on the contact-form path, so without this every
 * submission would add three queries to read the mailer configuration. Cleared
 * outright on any write rather than per key — the map holds at most six entries
 * and a settings change is a rare, deliberate act, so precision buys nothing
 * and a partially-cleared cache is a bug waiting to happen.
 *
 * Process-local. Multi-instance would mean one instance serving a stale value
 * for up to the TTL, which is the same exposure the public content cache
 * already accepts.
 */
let cache: Map<string, string | undefined> | null = null
let cacheExpiresAt = 0
const CACHE_TTL_MS = 30_000

export function invalidateSettingsCache() {
  cache = null
  cacheExpiresAt = 0
}

async function loadResolved() {
  if (cache && Date.now() < cacheExpiresAt) return cache

  const resolved = new Map<string, string | undefined>()
  let rows: { key: string; value: string; encrypted: boolean }[] = []

  try {
    rows = await prisma.setting.findMany({
      where: { key: { in: SETTING_KEYS } },
      select: { key: true, value: true, encrypted: true },
    })
  } catch (error) {
    // A missing table or an unreachable database must not take down the
    // features that read settings — they should behave exactly as they did
    // before this module existed, reading the environment.
    console.error('[settings] could not read the Setting table', error)
  }

  const stored = new Map(rows.map((r) => [r.key, r]))

  for (const def of SETTINGS) {
    const row = stored.get(def.key)
    const fromDb = row
      ? row.encrypted
        ? decryptSecret(row.value)
        : row.value
      : null

    // A row that fails to decrypt (rotated SETTINGS_KEY) is treated as absent
    // rather than as an empty value, so the environment fallback still applies.
    const value = fromDb?.trim() || process.env[def.key]?.trim() || undefined
    resolved.set(def.key, value)
  }

  cache = resolved
  cacheExpiresAt = Date.now() + CACHE_TTL_MS
  return resolved
}

/** The effective value for a key: database first, then environment. */
export async function getSetting(key: string): Promise<string | undefined> {
  const resolved = await loadResolved()
  return resolved.get(key)
}

/** Several at once, without paying for a separate resolution pass each. */
export async function getSettings<K extends string>(
  keys: readonly K[]
): Promise<Record<K, string | undefined>> {
  const resolved = await loadResolved()
  return Object.fromEntries(keys.map((k) => [k, resolved.get(k)])) as Record<
    K,
    string | undefined
  >
}

export type SettingStatus = SettingDefinition & {
  configured: boolean
  /** Where the effective value came from. */
  source: 'database' | 'environment' | null
  /**
   * For a secret: the last four characters only. For a non-secret: the value.
   * This is the only form in which a stored value leaves the server.
   */
  hint: string | null
  updatedAt: string | null
}

/**
 * The view the settings screen renders.
 *
 * Deliberately not "the settings with their values". A secret's plaintext has
 * no reason to reach the browser — the form does not need it to accept a
 * replacement, and sending it would put every API key into page HTML, the
 * browser cache and any screenshot of that screen.
 */
export async function getSettingsStatus(): Promise<{
  encryptionAvailable: boolean
  settings: SettingStatus[]
}> {
  const rows = await prisma.setting
    .findMany({ where: { key: { in: SETTING_KEYS } } })
    .catch(() => [])
  const stored = new Map(rows.map((r) => [r.key, r]))
  const resolved = await loadResolved()

  return {
    encryptionAvailable: isEncryptionConfigured(),
    settings: SETTINGS.map((def) => {
      const row = stored.get(def.key)
      const dbValue = row
        ? row.encrypted
          ? decryptSecret(row.value)
          : row.value
        : null
      const effective = resolved.get(def.key)
      const source = !effective ? null : dbValue?.trim() ? 'database' : 'environment'

      return {
        ...def,
        configured: Boolean(effective),
        source,
        hint: effective ? (def.secret ? maskSecret(effective) : effective) : null,
        updatedAt: row?.updatedAt.toISOString() ?? null,
      }
    }),
  }
}

/**
 * Writes a value, encrypting it when the definition says it is a secret.
 *
 * Refuses rather than silently storing a secret in plain text when
 * `SETTINGS_KEY` is missing. That refusal is the whole reason the screen tells
 * you encryption is unavailable before you type anything into those fields.
 */
export async function writeSetting(key: string, rawValue: string) {
  const def = BY_KEY.get(key)
  if (!def) throw new Error(`Unknown setting: ${key}`)

  const value = rawValue.trim()
  if (!value) return clearSetting(key)

  if (def.secret && !isEncryptionConfigured()) {
    throw new Error(
      'SETTINGS_KEY is not set, so secrets cannot be stored securely. Set it in .env and restart before saving this field.'
    )
  }

  const stored = def.secret ? encryptSecret(value) : value

  await prisma.setting.upsert({
    where: { key },
    create: { key, value: stored, encrypted: def.secret },
    update: { value: stored, encrypted: def.secret },
  })

  invalidateSettingsCache()
}

/**
 * Removes the stored value so the environment variable applies again.
 *
 * Distinct from writing an empty string: an empty row would resolve to
 * undefined and shadow a perfectly good .env value, which reads as "the setting
 * is broken" rather than "the setting is not overridden".
 */
export async function clearSetting(key: string) {
  if (!isKnownSetting(key)) throw new Error(`Unknown setting: ${key}`)
  await prisma.setting.deleteMany({ where: { key } })
  invalidateSettingsCache()
}
