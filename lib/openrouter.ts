import { getSetting } from '@/lib/settings'

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
const MUSIC_FAMILIES = ['lyria', 'suno', 'udio', 'musicgen']

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
    matches: (m) =>
      m.outputs.includes('audio') &&
      !MUSIC_FAMILIES.some((family) => m.id.toLowerCase().includes(family)),
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
  /** Dollars per million prompt tokens, or null when the model is free. */
  promptPrice: number | null
  completionPrice: number | null
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

/** Per-million-token dollars. The catalogue quotes per-token, which reads as 0.00. */
function perMillion(value: string | undefined): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n * 1_000_000 : null
}

function normalise(raw: RawModel): CatalogueModel {
  const params = raw.supported_parameters ?? []
  return {
    id: raw.id,
    name: raw.name ?? raw.id,
    inputs: raw.architecture?.input_modalities ?? [],
    outputs: raw.architecture?.output_modalities ?? [],
    contextLength: raw.context_length ?? null,
    promptPrice: perMillion(raw.pricing?.prompt),
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
    throw new OpenRouterError('Could not reach OpenRouter.', 502)
  }

  if (!response.ok) {
    throw new OpenRouterError(`OpenRouter returned ${response.status}.`, 502)
  }

  const body = (await response.json()) as { data?: RawModel[] }
  const value = (body.data ?? [])
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
    .sort((a, b) => (a.promptPrice ?? 0) - (b.promptPrice ?? 0))
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

function describeFailure(status: number, body: string): OpenRouterError {
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
      502
    )
  }
  // Distinct from 401 on purpose: a valid key with an empty balance otherwise
  // reads as a broken integration and sends the owner rotating a fine key.
  if (status === 402) {
    return new OpenRouterError(
      'OpenRouter reports no credit remaining on this key.',
      502
    )
  }
  if (status === 404) {
    return new OpenRouterError(
      `OpenRouter has no such model. Choose another in Settings → Models.${detail ? ` (${detail})` : ''}`,
      502
    )
  }
  if (status === 429) {
    return new OpenRouterError('OpenRouter rate limit reached. Try again shortly.', 429)
  }
  return new OpenRouterError(
    detail || `OpenRouter returned ${status}.`,
    status >= 500 ? 502 : 400
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
    throw new OpenRouterError('Could not reach OpenRouter.', 502)
  }

  if (!response.ok) throw describeFailure(response.status, await response.text())

  const body = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[]
  }
  const content = body.choices?.[0]?.message?.content
  if (!content?.trim()) {
    throw new OpenRouterError('The model returned an empty response.', 502)
  }
  return content
}

/**
 * A completion parsed as JSON.
 *
 * Models wrap JSON in ``` fences often enough that a bare `JSON.parse` fails on
 * a response that is otherwise perfectly good, and `json: true` is only a hint —
 * 52 of the 337 models in the catalogue do not advertise `response_format` at
 * all. Stripping the fence is the difference between the feature working on any
 * model and working on some of them.
 */
export async function chatJson<T>(options: ChatOptions): Promise<T> {
  const raw = await chat({ ...options, json: true })
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Last resort: the outermost braces. Some models prepend a sentence of
    // commentary despite being told not to.
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T
      } catch {
        /* fall through to the error below */
      }
    }
    throw new OpenRouterError(
      'The model did not return usable JSON. Try a model marked as supporting structured output.',
      502
    )
  }
}
