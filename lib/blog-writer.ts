/**
 * Drafting a blog post from a topic.
 *
 * Pure and environment-free, mirroring lib/case-study-draft.ts, so the route
 * and the admin client can share it and neither can read a secret.
 *
 * ## What this is, honestly
 *
 * Unlike the case-study drafter, this is **not grounded in anything**. It writes
 * from the model's own knowledge, and nothing here can check a claim it makes.
 * That was a deliberate choice by the owner, and the design answers it in the
 * two places it can:
 *
 * - The result is always a **draft**. Nothing written here can reach the public
 *   site without a second, explicit action.
 * - The prompt forbids **first-person claims**. A post may explain how SSRF
 *   filtering works; it may never say "when I built this at Kidocode", because
 *   the model has no way to know that and the byline belongs to someone real.
 *   Everything else the model gets wrong is an error a reader might catch — an
 *   invented biography is one only the owner can be blamed for.
 */

export type PostLength = 'short' | 'standard' | 'deep'

export const POST_LENGTHS: { value: PostLength; label: string; words: string }[] = [
  { value: 'short', label: 'Short', words: '400–600 words' },
  { value: 'standard', label: 'Standard', words: '800–1,200 words' },
  { value: 'deep', label: 'In depth', words: '1,500–2,000 words' },
]

const WORD_TARGET: Record<PostLength, string> = {
  short: '400 to 600 words',
  standard: '800 to 1200 words',
  deep: '1500 to 2000 words',
}

export type DraftedPost = {
  title: string
  summary: string
  body: string
  tags: string[]
}

export function buildPostPrompt(topic: string, length: PostLength = 'standard') {
  const system = [
    'You write technical blog posts for a working software engineer\'s personal site.',
    'The reader is another engineer. Assume competence; explain the specifics.',
    '',
    'Absolute rules:',
    '1. Never write in the first person about experience, employers, projects, clients or results. You do not know the author. Write about the subject, not about them. No "I built", no "in my experience", no "we found", no "at my last job".',
    '2. Invent no statistics, benchmarks, dates, version numbers, prices, company names or quotations. If a number would normally appear and you do not know it, describe the shape of the trade-off instead.',
    '3. Cite nothing. No links, no paper titles, no author names, no documentation references. A fabricated citation is worse than none, and you cannot verify one.',
    '4. Markdown only. Use ## and ### headings, lists, and fenced code blocks with a language tag. No raw HTML, no front matter, no images, no title heading — the title is a separate field.',
    '5. Plain and specific. No introductory throat-clearing, no "in today\'s fast-paced world", no closing exhortation to like and subscribe. Start with the actual problem.',
    '',
    `Aim for ${WORD_TARGET[length]}.`,
    '',
    'Return a JSON object and nothing else:',
    '{"title":"…","summary":"…","body":"…markdown…","tags":["…"]}',
    '',
    'title: under 70 characters, specific, no colon-subtitle cliché.',
    'summary: one or two sentences, under 200 characters, describing what the reader will learn. It is used as the search-result description.',
    'tags: three to six, each a real technology or concept, capitalised as the ecosystem writes it (TypeScript, PostgreSQL, Next.js).',
  ].join('\n')

  return { system, user: `Write a post about: ${topic.trim()}` }
}

type RawDraft = {
  title?: unknown
  summary?: unknown
  body?: unknown
  tags?: unknown
}

/**
 * Parses the model's JSON into something the form can hold.
 *
 * Returns null rather than a half-filled post when the title or body is
 * missing: a draft with no body is not a starting point, it is a blank form
 * that looks like a failure the owner has to diagnose.
 */
export function parsePostDraft(raw: unknown): DraftedPost | null {
  const d = raw as RawDraft
  const title = typeof d?.title === 'string' ? d.title.trim() : ''
  const body = typeof d?.body === 'string' ? cleanBody(d.body) : ''
  if (!title || !body) return null

  const tags = Array.isArray(d.tags)
    ? d.tags.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean).slice(0, 8)
    : []

  return {
    title: title.slice(0, 200),
    summary: (typeof d.summary === 'string' ? d.summary.trim() : '').slice(0, 500),
    body,
    tags,
  }
}

/**
 * Strips what the prompt asked the model not to produce but sometimes does.
 *
 * A leading `# Title` duplicates the title field and renders as a second
 * headline on the page; YAML front matter renders as a stray paragraph of
 * `---`. Both are cosmetic rather than dangerous — raw HTML is handled at
 * render time in components/PostBody.tsx, where it belongs, since that is the
 * boundary that protects hand-written posts too.
 */
function cleanBody(body: string): string {
  return body
    .replace(/^\s*---\n[\s\S]*?\n---\s*/, '')
    .replace(/^\s*#\s+.*\n+/, '')
    .trim()
}
