import { getSetting } from '@/lib/settings'
import { UPSTREAM_FAILED } from '@/lib/http'

/**
 * OpenRouter — one key and one base URL in front of every model provider.
 *
 * Server-only. The key must never reach the browser, which is why the catalogue
 * route returns a trimmed model list rather than letting the client call
 * OpenRouter directly.
 *
 * Plain `fetch` rather than the OpenAI SDK pointed at a custom baseURL. The SDK
 * would work — OpenRouter is wire-compatible — but it is 10 MB to send three
 * headers, it has no idea about `/models`, and the error bodies that matter here
 * (402 no credits, 404 unknown model) are OpenRouter's, not OpenAI's, so the
 * mapping has to be bespoke either way.
 */

const API = 'https://openrouter.ai/api/v1'

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'OpenRouterError'
  }
}

/* ────────────────────────── model roles ────────────────────────── */

export type ModelRole = 'text' | 'stt' | 'tts' | 'image'

/**
 * Music generators, excluded from the speech role.
 *
 * `google/lyria-3-*` declares `output_modalities: ['audio']` exactly as
 * `openai/gpt-audio` does — the catalogue exposes no field that separates "reads
 * a sentence aloud" from "composes a track", and `supported_voices` is null on
 * both. Choosing Lyria where speech was meant produces a jingle.
 *
 * A blocklist rather than the tempting inference "real speech models also accept
 * audio input": that is true of today's four models and would silently exclude a
 * pure text→audio TTS model the day one appears.
 */
const MUSIC_FAMILIES = new Set(['lyria', 'suno', 'udio', 'musicgen'])

/**
 * Whole name-segments, never a substring.
 *
 * `openai/gpt-audio` contains "udio" inside "a-udio", so a naive
 * `id.includes(family)` filtered out both real speech models and left the
 * dropdown empty. Splitting on non-alphanumerics and comparing whole tokens is
 * what makes "udio" match udio and not audio.
 */
function isMusicModel(id: string) {
  return id
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .some((token) => MUSIC_FAMILIES.has(token))
}

export type ModelRoleDefinition = {
  role: ModelRole
  /** The `Setting` key holding the chosen model id. */
  settingKey: string
  label: string
  help: string
  /** Whether anything in the app currently calls a model in this role. */
  wired: boolean
  matches: (model: CatalogueModel) => boolean
}

export const MODEL_ROLES: ModelRoleDefinition[] = [
  {
    role: 'text',
    settingKey: 'MODEL_TEXT',
    label: 'Text model',
    wired: true,
    help: 'Drafts case-study fields from a repository, and rewrites voice transcriptions. Anything that outputs text qualifies; models advertising structured output are marked, and the drafter is more reliable on those.',
    matches: (m) => m.outputs.includes('text'),
  },
  {
    role: 'stt',
    settingKey: 'MODEL_STT',
    label: 'Speech-to-text model',
    wired: true,
    help: 'Transcribes the voice button on the description fields. These are multimodal chat models that accept audio, not dedicated transcription endpoints.',
    matches: (m) => m.inputs.includes('audio'),
  },
  {
    role: 'tts',
    settingKey: 'MODEL_TTS',
    label: 'Text-to-speech model',
    wired: false,
    help: 'No feature uses this yet — it is here so the choice is already made when one does. Music generators are filtered out; only speech models are listed.',
    matches: (m) => m.outputs.includes('audio') && !isMusicModel(m.id),
  },
  {
    role: 'image',
    settingKey: 'MODEL_IMAGE',
    label: 'Image model',
    wired: false,
    help: 'No feature uses this yet. Note that generating a screenshot of a real project would misrepresent it — the plausible use is social-card artwork, not project imagery.',
    matches: (m) => m.outputs.includes('image'),
  },
]

/*
 * Video is deliberately absent. Of 337 models in the catalogue, 48 accept video
 * as input and none produce it, so a video role would render an empty dropdown.
 * Adding one is a single entry here once a provider exists.
 */

export const MODEL_SETTING_KEYS = MODEL_ROLES.map((r) => r.settingKey)

/* ────────────────────────── catalogue ────────────────────────── */

export type CatalogueModel = {
  id: string
  name: string
  inputs: string[]
  outputs: string[]
  contextLength: number | null
  /** Dollars per million prompt tokens, or null when the catalogue omits it. */
  promptPrice: number | null
  completionPrice: number | null
  /** `promptPrice` ready to display, so the client formats nothing. */
  priceLabel: string | null
  /** Advertises `response_format` or `structured_outputs`. */
  structured: boolean
}

type RawModel = {
  id: string
  name?: string
  context_length?: number | null
  architecture?: {
    input_modalities?: string[]
    output_modalities?: string[]
  }
  pricing?: { prompt?: string; completion?: string }
  supported_parameters?: string[]
}

/**
 * Per-million-token dollars, or null when there is no fixed price.
 *
 * The catalogue quotes per-token, which renders as 0.00 unless scaled.
 *
 * **`-1` is a sentinel, not a price.** OpenRouter uses it for models whose cost
 * depends on where the request is routed — `openrouter/fusion`,
 * `pareto-code` and `bodybuilder` all carry it. Multiplied out that becomes
 * −1,000,000, which sorted them to the head of every dropdown as the cheapest
 * models available and printed a negative price beside them.
 */
function perMillion(value: string | undefined): number | null {
  // Number(undefined) and Number('abc') are NaN; Number('') is 0, which would
  // claim a model is free. Only a non-empty numeric string is a price.
  if (typeof value !== 'string' || value.trim() === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return n * 1_000_000
}

/**
 * A price a person can read, formatted where it can be tested.
 *
 * Server-side rather than in the settings page because a client component
 * importing this module would pull `lib/settings.ts`, and therefore Prisma, into
 * the browser bundle. The dropdown renders the string it is given.
 */
export function formatPerMillion(perMillionDollars: number): string {
  if (perMillionDollars === 0) return 'free'
  // Below the resolution of three decimals, "$0.000" reads as free and a naive
  // trailing-zero strip leaves the string "0." — say what is actually meant.
  if (perMillionDollars < 0.001) return '<$0.001/M'
  const fixed =
    perMillionDollars < 1
      ? perMillionDollars.toFixed(3)
      : perMillionDollars.toFixed(2)
  // toFixed always leaves a decimal point, so stripping it with the zeros is
  // safe: "0.150" → "0.15", "2.00" → "2", "10.00" → "10".
  return `$${fixed.replace(/\.?0+$/, '')}/M`
}

function normalise(raw: RawModel): CatalogueModel {
  const params = raw.supported_parameters ?? []
  const promptPrice = perMillion(raw.pricing?.prompt)
  return {
    id: raw.id,
    name: raw.name ?? raw.id,
    inputs: raw.architecture?.input_modalities ?? [],
    outputs: raw.architecture?.output_modalities ?? [],
    contextLength: raw.context_length ?? null,
    promptPrice,
    // Never blank: a model with no price shown reads as free, and three of these
    // are routers whose cost depends on where the request lands.
    priceLabel: promptPrice === null ? 'price varies' : formatPerMillion(promptPrice),
    completionPrice: perMillion(raw.pricing?.completion),
    structured:
      params.includes('response_format') || params.includes('structured_outputs'),
  }
}

/**
 * Successful catalogue reads only, for five minutes.
 *
 * Same shape and same reasoning as the repository cache in lib/github.ts:
 * caching a failure would leave every model dropdown empty for the whole window
 * after one transient blip, with no way out but waiting.
 */
let catalogue: { expiresAt: number; value: CatalogueModel[] } | null = null
const TTL_MS = 5 * 60_000

export async function listModels({ refresh = false } = {}): Promise<CatalogueModel[]> {
  if (!refresh && catalogue && Date.now() < catalogue.expiresAt) return catalogue.value

  let response: Response
  try {
    response = await fetch(`${API}/models`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new OpenRouterError('Could not reach OpenRouter.', UPSTREAM_FAILED)
  }

  if (!response.ok) {
    throw new OpenRouterError(`OpenRouter returned ${response.status}.`, UPSTREAM_FAILED)
  }

  const body = (await response.json()) as { data?: RawModel[] }

  // An empty catalogue is a malformed response, not a real answer — OpenRouter
  // always has models. Caching it would leave every dropdown blank for five
  // minutes with no way out, which is the same trap as caching a failure.
  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new OpenRouterError('OpenRouter returned no models.', UPSTREAM_FAILED)
  }

  const value = body.data
    // `openrouter/auto` is a router that reports every modality at once, so it
    // matches every filter below and would head each dropdown as though it were
    // a specific model. It is not one, and it makes the chosen model unknowable.
    .filter((m) => !m.id.startsWith('openrouter/auto'))
    .map(normalise)
    .sort((a, b) => a.id.localeCompare(b.id))

  catalogue = { expiresAt: Date.now() + TTL_MS, value }
  return value
}

/** The catalogue narrowed to one role, cheapest first. */
export async function modelsForRole(
  role: ModelRole,
  options?: { refresh?: boolean }
): Promise<CatalogueModel[]> {
  const definition = MODEL_ROLES.find((r) => r.role === role)
  if (!definition) throw new OpenRouterError(`Unknown model role: ${role}`, 400)

  const all = await listModels(options)
  return all
    .filter(definition.matches)
    // Unpriced sorts last, not first: `?? 0` would put every model whose cost is
    // unknown above the genuinely free ones, at the top of the list.
    .sort((a, b) => (a.promptPrice ?? Infinity) - (b.promptPrice ?? Infinity))
}

/**
 * The model to use for a role: the owner's choice, else the role default.
 *
 * Returns null rather than guessing when nothing is chosen and no default
 * exists, so the caller can say "pick a model in Settings" instead of failing
 * against some arbitrary model the owner never agreed to pay for.
 */
export async function getRoleModel(role: ModelRole): Promise<string | null> {
  const definition = MODEL_ROLES.find((r) => r.role === role)
  if (!definition) return null
  return (await getSetting(definition.settingKey))?.trim() || null
}

/* ────────────────────────── completions ────────────────────────── */

export type ChatMessage = {
  role: 'system' | 'user'
  content: string | unknown[]
}

async function requireKey(): Promise<string> {
  const key = (await getSetting('OPENROUTER_API_KEY'))?.trim()
  if (!key) {
    throw new OpenRouterError(
      'No OpenRouter API key. Add one in Settings → Models.',
      503
    )
  }
  return key
}

/**
 * The container the browser actually produced.
 *
 * MediaRecorder gives `audio/webm;codecs=opus` on Chrome and Firefox and
 * `audio/mp4` on Safari. Support varies by model — OpenAI's `input_audio`
 * documents wav and mp3, Gemini accepts considerably more — so the real format
 * is passed through and a rejection surfaced, rather than retried as a lie about
 * what the bytes are.
 *
 * Lives here rather than in the route because a `route.ts` may only export HTTP
 * methods and segment config; an extra export fails Next's route type check.
 */
export function audioFormat(mimeType: string): string {
  const base = (mimeType ?? '').split(';')[0].trim().toLowerCase()
  const known: Record<string, string> = {
    'audio/webm': 'webm',
    'video/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mp4': 'mp4',
    'audio/x-m4a': 'mp4',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/wave': 'wav',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
  }
  return known[base] ?? 'webm'
}

/**
 * A model's reply, parsed as JSON.
 *
 * Separated from the request so it can be tested without a network call, since
 * this is where a well-behaved model and a chatty one diverge. Models wrap JSON
 * in fences often enough that a bare `JSON.parse` fails on output that is
 * otherwise perfectly good, and `response_format` is only a hint — 52 of the 337
 * models in the catalogue do not advertise it at all.
 */
export function parseModelJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Last resort: the outermost braces. Some models prepend a sentence of
    // commentary despite being told to return only JSON.
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T
      } catch {
        /* fall through */
      }
    }
    throw new OpenRouterError(
      'The model did not return usable JSON. Try a model marked as supporting structured output.',
      UPSTREAM_FAILED
    )
  }
}

export function describeFailure(status: number, body: string): OpenRouterError {
  // OpenRouter puts the useful part in error.message; the rest is envelope.
  let detail = ''
  try {
    detail = (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? ''
  } catch {
    detail = body.slice(0, 200)
  }

  if (status === 401) {
    return new OpenRouterError(
      'OpenRouter rejected the key. Check it has not been revoked, in Settings.',
      UPSTREAM_FAILED
    )
  }
  // Distinct from 401 on purpose: a valid key with an empty balance otherwise
  // reads as a broken integration and sends the owner rotating a fine key.
  if (status === 402) {
    return new OpenRouterError(
      'OpenRouter reports no credit remaining on this key.',
      UPSTREAM_FAILED
    )
  }
  if (status === 404) {
    return new OpenRouterError(
      `OpenRouter has no such model. Choose another in Settings → Models.${detail ? ` (${detail})` : ''}`,
      UPSTREAM_FAILED
    )
  }
  if (status === 429) {
    return new OpenRouterError('OpenRouter rate limit reached. Try again shortly.', 429)
  }
  return new OpenRouterError(
    detail || `OpenRouter returned ${status}.`,
    status >= 500 ? UPSTREAM_FAILED : 400
  )
}

export type ChatOptions = {
  model: string
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
  /** Ask for a JSON object back. Ignored by models that do not advertise it. */
  json?: boolean
  timeoutMs?: number
}

/** One completion. Returns the assistant's text content. */
export async function chat(options: ChatOptions): Promise<string> {
  const key = await requireKey()

  let response: Response
  try {
    response = await fetch(`${API}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        // OpenRouter attributes usage to these and shows them on the activity
        // page, which is how a spend spike gets traced back to a feature.
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost',
        'X-Title': 'Portfolio CMS',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        max_tokens: options.maxTokens ?? 1500,
        temperature: options.temperature ?? 0.2,
        ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      }),
      cache: 'no-store',
      // Generous next to the 10s elsewhere: a long README through a reasoning
      // model genuinely takes this long, and the caller is a person who pressed
      // a button and is watching a spinner, not a page render.
      signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
    })
  } catch {
    throw new OpenRouterError('Could not reach OpenRouter.', UPSTREAM_FAILED)
  }

  if (!response.ok) throw describeFailure(response.status, await response.text())

  const body = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[]
  }
  const content = body.choices?.[0]?.message?.content
  if (!content?.trim()) {
    throw new OpenRouterError('The model returned an empty response.', UPSTREAM_FAILED)
  }
  return content
}

/** One completion, parsed as JSON. See `parseModelJson` for the recovery rules. */
export async function chatJson<T>(options: ChatOptions): Promise<T> {
  return parseModelJson<T>(await chat({ ...options, json: true }))
}
