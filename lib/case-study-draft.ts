/**
 * Drafting case-study fields from a repository.
 *
 * Pure and environment-free, for the same reason as lib/repo-import.ts: this is
 * imported by both the API route and the client component, so anything reading
 * `process.env` here would be a secret one bundler decision away from the
 * browser.
 *
 * ## What this may and may not write
 *
 * A project has twelve case-study fields. This drafts **five**. That is not a
 * phased rollout — it is the shape of the available evidence.
 *
 * The READMEs on the account this was built for are operator documentation:
 * Features, Architecture, Quick Start, API Endpoints, SSRF Protection,
 * Configuration, Deployment, Concurrency, Resumable runs, Error handling. They
 * are rich in engineering substance and contain nothing whatsoever about who the
 * work was for, what was wrong before it existed, or how it turned out.
 *
 * So `outcome` and `lessons` — and `problem`, `audience`, `myRole`,
 * `responsibilities`, `status` — are excluded at the type level rather than
 * merely omitted from a list, so a later edit cannot quietly reintroduce one.
 * An outcome is a verifiable claim and a lesson is personal reflection; a model
 * writing either from install instructions is precisely the invention this
 * project refuses everywhere else.
 */

/** The only fields a repository may be asked to draft. */
export type DraftableField =
  | 'approach'
  | 'keyDecisions'
  | 'constraints'
  | 'challenges'
  | 'context'

export type DraftFieldDefinition = {
  field: DraftableField
  label: string
  /** Told to the model, so the draft arrives in the format the field parses. */
  format: string
  /** What in a repository would legitimately support this field. */
  evidence: string
}

export const DRAFTABLE_FIELDS: DraftFieldDefinition[] = [
  {
    field: 'context',
    label: 'Context',
    format: 'One short paragraph of prose.',
    evidence: 'the overview or "what it does" section, and the repository description',
  },
  {
    field: 'approach',
    label: 'Approach',
    format: 'One or two paragraphs of prose.',
    evidence: 'the architecture, design, or module-structure sections, and the file tree',
  },
  {
    field: 'keyDecisions',
    label: 'Key decisions',
    format:
      'One per line, each exactly "Decision: rationale". No bullet characters, no numbering.',
    evidence:
      'sections describing a deliberate technical choice and why — concurrency, caching, retries, security posture, storage format',
  },
  {
    field: 'constraints',
    label: 'Constraints',
    format: 'One per line. No bullet characters, no numbering.',
    evidence: 'requirements, configuration, environment variables, stated limits or quotas',
  },
  {
    field: 'challenges',
    label: 'Challenges',
    format: 'One per line. No bullet characters, no numbering.',
    evidence:
      'sections about error handling, reliability, edge cases, or known problems',
  },
]

export const DRAFTABLE_KEYS = DRAFTABLE_FIELDS.map((f) => f.field)

const DRAFTABLE_SET = new Set<string>(DRAFTABLE_KEYS)

/** Whether a key is one the drafter is permitted to return. */
export function isDraftableField(key: string): key is DraftableField {
  return DRAFTABLE_SET.has(key)
}

/* ────────────────────────── evidence ────────────────────────── */

export type RepoEvidence = {
  fullName: string
  description: string | null
  language: string | null
  topics: string[]
  /** Decoded README markdown, or null when the repository has none. */
  readme: string | null
  /** Blob paths from the recursive tree, already truncated. */
  tree: string[]
  isPrivate: boolean
}

/**
 * README prose is required, and the file tree cannot substitute for it.
 *
 * A tree tells you the stack; it never tells you the reasoning. Drafting "Key
 * decisions" from a directory listing would mean inventing the rationale, which
 * is the one thing this feature exists not to do — so a repository with a rich
 * tree and no prose is refused just as firmly as an empty one.
 *
 * 120 words is calibrated against real repositories rather than chosen for
 * roundness: martify-v1.2 (389 words) is the thinnest README that still yields
 * usable material, and E-commerce_front_end (8 words) is the richest that does
 * not. Anything between those is a judgement call the owner makes by reading
 * the draft.
 */
export const MIN_README_WORDS = 120

export type EvidenceVerdict =
  | { sufficient: true; readmeWords: number }
  | { sufficient: false; reason: string }

export function assessEvidence(evidence: RepoEvidence): EvidenceVerdict {
  if (!evidence.readme?.trim()) {
    return {
      sufficient: false,
      reason: `${evidence.fullName} has no README. There is nothing to draft from — a file tree shows the stack but never the reasoning, and inventing it is exactly what this must not do.`,
    }
  }

  const words = countWords(evidence.readme)
  if (words < MIN_README_WORDS) {
    return {
      sufficient: false,
      reason: `${evidence.fullName}'s README is ${words} word${words === 1 ? '' : 's'} — too little to draft from without inventing. Write a few paragraphs about what it does and why it is built that way, then try again.`,
    }
  }

  return { sufficient: true, readmeWords: words }
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * README trimmed to what is worth sending.
 *
 * Fenced code blocks go first: they are the bulk of an operator README, they
 * are almost never the reasoning, and a 15 KB README is mostly shell snippets.
 * Badge images and HTML comments follow. What survives is the prose the draft
 * is supposed to be grounded in.
 */
export function condenseReadme(readme: string, maxChars = 12_000) {
  const condensed = readme
    .replace(/```[\s\S]*?```/g, '\n[code omitted]\n')
    .replace(/^\s*\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)\s*$/gm, '')
    .replace(/^\s*!\[[^\]]*\]\([^)]*\)\s*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return condensed.length <= maxChars
    ? condensed
    : `${condensed.slice(0, maxChars)}\n\n[truncated]`
}

/**
 * Directories rather than every path.
 *
 * The architectural signal is "there is a services/ and a workers/ and a
 * migrations/", not which 400 files are inside them. Sending the full tree
 * spends thousands of tokens to say the same thing less clearly.
 */
export function summariseTree(paths: string[], maxEntries = 60) {
  const directories = new Map<string, number>()
  const rootFiles: string[] = []

  for (const path of paths) {
    const segments = path.split('/')
    if (segments.length === 1) {
      rootFiles.push(path)
      continue
    }
    // Drop the filename first, then keep at most two levels: "app/api" says more
    // than "app", and "app/api/github" says no more once file counts are shown.
    const key = segments.slice(0, -1).slice(0, 2).join('/')
    directories.set(key, (directories.get(key) ?? 0) + 1)
  }

  const dirs = [...directories.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxEntries)
    .map(([dir, count]) => `${dir}/ (${count} files)`)

  return [...rootFiles.slice(0, 20), ...dirs].join('\n')
}

/* ────────────────────────── the prompt ────────────────────────── */

/**
 * The contract the draft depends on.
 *
 * Two rules carry all the weight. Every sentence must be traceable to the
 * supplied text, and a field with no support must come back null rather than
 * filled — because a plausible paragraph with no basis is worse than a blank
 * field the owner knows to write themselves.
 *
 * The `evidence` string each field must cite is not decoration. It renders
 * beside the value in the dashboard, which is what makes a fabrication visible:
 * invented prose cannot name the heading it came from.
 */
export function buildDraftPrompt(evidence: RepoEvidence) {
  const fieldSpec = DRAFTABLE_FIELDS.map(
    (f) => `- "${f.field}" (${f.label}) — ${f.format} Draw only from ${f.evidence}.`
  ).join('\n')

  const system = [
    'You draft portfolio case-study notes from a software repository.',
    '',
    'Absolute rules:',
    '1. Every statement must be traceable to the supplied README or file tree. You may summarise, condense and rephrase. You may not add, infer or embellish.',
    '2. If the supplied material does not support a field, return null for it. A null is a correct and expected answer. Never fill a field to be helpful.',
    '3. Never state results, metrics, adoption, user counts, revenue, timelines or team size. None of that is in the material and none of it is yours to claim.',
    '4. Never write in the first person and never describe anyone\'s role or responsibilities.',
    '5. Plain prose. No marketing language, no superlatives, no emoji, no markdown headings or bullet characters.',
    '',
    'For each field you fill, cite the specific README heading or file path that supports it.',
    '',
    'Return a JSON object, and nothing else, of the form:',
    '{"fields":{"<field>":{"value":"…","evidence":"README § Architecture"}|null}}',
    '',
    'Fields:',
    fieldSpec,
  ].join('\n')

  const user = [
    `Repository: ${evidence.fullName}`,
    evidence.description ? `Description: ${evidence.description}` : null,
    evidence.language ? `Primary language: ${evidence.language}` : null,
    evidence.topics.length ? `Topics: ${evidence.topics.join(', ')}` : null,
    '',
    '--- README ---',
    condenseReadme(evidence.readme ?? ''),
    '',
    '--- FILE TREE ---',
    summariseTree(evidence.tree),
  ]
    .filter((line) => line !== null)
    .join('\n')

  return { system, user }
}

/* ────────────────────────── the response ────────────────────────── */

export type DraftedField = {
  field: DraftableField
  label: string
  value: string
  /** The README heading or path the model says supports this. */
  evidence: string
}

export type DraftResult = {
  drafted: DraftedField[]
  /** Fields the model declined, so a refusal is visible rather than a silent gap. */
  declined: { field: DraftableField; label: string }[]
}

type RawDraft = {
  fields?: Record<string, { value?: unknown; evidence?: unknown } | null>
}

/**
 * Parses the model's JSON into fields the form can apply.
 *
 * Defensive on every axis, because this is the boundary where a model's output
 * becomes content published under the owner's name:
 *
 * - Keys outside `DraftableField` are dropped rather than passed through. This
 *   is what stops a model helpfully returning `outcome` from reaching the form.
 * - A field with a value but no evidence is dropped. The citation is the review
 *   mechanism; a value without one has nothing to check it against.
 * - Bullet characters are stripped from the line-per-item fields, which parse on
 *   newlines and would otherwise render a literal "- " on the public page.
 */
export function parseDraftResponse(raw: unknown): DraftResult {
  const fields = (raw as RawDraft)?.fields
  const drafted: DraftedField[] = []
  const declined: DraftResult['declined'] = []

  for (const definition of DRAFTABLE_FIELDS) {
    const entry = fields?.[definition.field]
    const value = typeof entry?.value === 'string' ? cleanValue(entry.value) : ''
    const evidence = typeof entry?.evidence === 'string' ? entry.evidence.trim() : ''

    if (value && evidence) {
      drafted.push({ field: definition.field, label: definition.label, value, evidence })
    } else {
      declined.push({ field: definition.field, label: definition.label })
    }
  }

  return { drafted, declined }
}

function cleanValue(value: string) {
  return value
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trimEnd())
    .join('\n')
    .trim()
}
