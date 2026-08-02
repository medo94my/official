/**
 * Turning a GitHub repository into a draft project.
 *
 * Pure and environment-free on purpose: this is imported by both the API route
 * and the client component, so anything reading `process.env` here would be a
 * secret one bundler decision away from the browser.
 *
 * Everything here produces a *draft*. Nothing it returns is saved without the
 * owner seeing it in the form first — which is why the heuristics below are
 * allowed to be imperfect. Getting a title slightly wrong costs a keystroke;
 * inventing a case study would cost the site its credibility.
 */

export type RepoSummary = {
  id: number
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  homepage: string | null
  topics: string[]
  language: string | null
  isPrivate: boolean
  isFork: boolean
  isArchived: boolean
  stars: number
  /** ISO string, never a Date — see the note in lib/github.ts about caching. */
  pushedAt: string
}

/** Uppercased whole, because title case makes them look like words. */
const ACRONYMS = new Set([
  'api', 'ui', 'ux', 'cli', 'sdk', 'cms', 'crm', 'css', 'html', 'js', 'ts',
  'sql', 'url', 'http', 'io', 'db', 'ai', 'ml', 'pdf', 'qr', 'seo', 'aws',
  'gcp', 'rss', 'ssr', 'orm', 'jwt', 'gis',
])

/**
 * GitHub forces topics to lowercase and hyphens, and they render on the public
 * site beside tags typed by hand. Without this a portfolio built half by import
 * shows "React, TypeScript" on one project and "react, typescript, nextjs" on
 * the next, which is small, visible, and makes the import feel cheap.
 */
const TOPIC_LABELS: Record<string, string> = {
  nextjs: 'Next.js', nodejs: 'Node.js', node: 'Node.js', reactjs: 'React',
  typescript: 'TypeScript', javascript: 'JavaScript', postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL', mysql: 'MySQL', mongodb: 'MongoDB', graphql: 'GraphQL',
  fastapi: 'FastAPI', tailwindcss: 'Tailwind CSS', vuejs: 'Vue', dotnet: '.NET',
  php: 'PHP', laravel: 'Laravel', django: 'Django', flask: 'Flask',
  'github-actions': 'GitHub Actions', docker: 'Docker', kubernetes: 'Kubernetes',
}

function capitalise(token: string) {
  const lower = token.toLowerCase()
  if (ACRONYMS.has(lower)) return lower.toUpperCase()
  // A version suffix is not a word: martify-v1.2 should not become "V1.2".
  if (/^v\d/.test(lower)) return lower
  // Already deliberately cased by the author — iOS, gRPC — so leave it alone.
  if (/[A-Z]/.test(token.slice(1))) return token
  return token.charAt(0).toUpperCase() + token.slice(1)
}

/**
 * A repository name as a human would write it.
 *
 *   MapsScraper          -> Maps Scraper
 *   screenshot-api       -> Screenshot API
 *   martify-v1.2         -> Martify v1.2
 *   E-commerce_front_end -> E-commerce Front End
 *
 * It will get some names wrong. That is acceptable because the result lands in
 * an editable input the owner is already looking at — chasing the tail with a
 * longer rule table would add failure modes without removing the review step.
 */
export function humanizeRepoName(name: string) {
  return name
    // Not on '.' — that would split the version in martify-v1.2.
    .split(/[_\s]+/)
    .flatMap((chunk) => {
      const parts = chunk.split('-')
      const out: string[] = []
      for (let i = 0; i < parts.length; i++) {
        // A lone letter before another part is a prefix, not a word:
        // E-commerce and X-ray read as typos once split.
        if (parts[i].length === 1 && /[a-z]/i.test(parts[i]) && parts[i + 1]) {
          out.push(`${parts[i]}-${parts[i + 1]}`)
          i++
        } else if (parts[i]) {
          out.push(parts[i])
        }
      }
      return out
    })
    .flatMap((token) =>
      token
        // APIClient -> API Client, not APIC lient. Order matters.
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(' ')
    )
    .filter(Boolean)
    .map(capitalise)
    .join(' ')
}

/**
 * `owner/repo`, lowercased — the identity two spellings of a GitHub URL share.
 *
 * `Project.githubUrl` is typed by hand, so it turns up with a trailing slash, a
 * `.git` suffix, `www.`, different case, or pointing at a subpage. Comparing
 * raw strings misses every one of those, and the picker would then offer a repo
 * that is already in the CMS — which 409s on save, because both title and slug
 * are unique. A non-GitHub URL returns null and can never match.
 */
export function repoIdentity(url: string | null | undefined): string | null {
  if (!url?.trim()) return null
  try {
    const parsed = new URL(url.trim())
    if (parsed.hostname.replace(/^www\./, '').toLowerCase() !== 'github.com') return null
    const [owner, repo] = parsed.pathname.split('/').filter(Boolean)
    if (!owner || !repo) return null
    return `${owner}/${repo.replace(/\.git$/i, '')}`.toLowerCase()
  } catch {
    return null
  }
}

/**
 * `homepage` is free text on GitHub — people put "coming soon" and
 * "www.example.com" in it. This value flows into an `<a href>` on the public
 * site, so anything that is not a real absolute URL is dropped rather than
 * guessed at: prepending a scheme to `www.x.com` would be inventing a
 * destination.
 */
function usableUrl(value: string | null): string {
  if (!value?.trim()) return ''
  try {
    const parsed = new URL(value.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : ''
  } catch {
    return ''
  }
}

/**
 * Tags from topics, falling back to the primary language.
 *
 * In practice the fallback does most of the work: of 116 repositories on the
 * account this was built for, exactly one had topics set. Calling
 * /repos/{owner}/{repo}/languages instead was considered and rejected — it is a
 * request per repository, and it returns byte counts across the whole tree, so
 * a Next.js project comes back as CSS, Dockerfile and Shell. Those are build
 * artefacts, not portfolio tags.
 */
export function repoTags(repo: Pick<RepoSummary, 'topics' | 'language'>): string[] {
  const source = repo.topics.length > 0 ? repo.topics : repo.language ? [repo.language] : []
  const seen = new Set<string>()

  return source
    .map((topic) => TOPIC_LABELS[topic.toLowerCase()] ?? humanizeRepoName(topic))
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)
}

export type RepoPrefill = {
  title: string
  description: string
  githubUrl: string
  liveUrl: string
  tags: string
}

/**
 * The subset of the project form a repository can honestly fill in.
 *
 * `slug` is left out so the form's own derive-from-title path runs and its live
 * preview shows the result — one source of truth for slugs, not two. `image`
 * and `specs` are left out deliberately: GitHub's social card is a grey
 * rectangle the public site's image host allowlist would reject anyway, and
 * prefilling "Language: TypeScript / Stars: 4" into the spec grid is
 * machine-generated filler published under the owner's name.
 */
export function repoPrefill(repo: RepoSummary): RepoPrefill {
  return {
    title: humanizeRepoName(repo.name),
    // A leading emoji is common in GitHub descriptions and this prose renders
    // on the public site, which is deliberately emoji-free.
    description: (repo.description ?? '').replace(/^[\p{Extended_Pictographic}️\s]+/u, '').trim(),
    githubUrl: repo.htmlUrl,
    liveUrl: usableUrl(repo.homepage),
    tags: repoTags(repo).join(', '),
  }
}

/**
 * The fields a comparison may offer. `title` is excluded at the type level, not
 * just by omission from the list below, so a later edit cannot quietly
 * reintroduce it — it is unique in the database and re-offering it would be
 * noise with a 409 behind it.
 */
export type SyncableField = 'description' | 'githubUrl' | 'liveUrl' | 'tags'

export type FieldDiff = {
  field: SyncableField
  label: string
  current: string
  incoming: string
}

/**
 * Which fields a stored project and its repository disagree about.
 *
 * `title` is excluded on purpose. It is unique in the database, it is the
 * owner's editorial choice, and `humanizeRepoName` is a heuristic — re-offering
 * it on every comparison would be noise with a 409 waiting behind it.
 *
 * Fields that already match are omitted entirely, so a project in sync shows
 * nothing rather than a list of confirmations to read past.
 */
export function diffRepoFields(
  current: Pick<RepoPrefill, SyncableField>,
  repo: RepoSummary
): FieldDiff[] {
  const incoming = repoPrefill(repo)
  const fields: { field: SyncableField; label: string }[] = [
    { field: 'description', label: 'Description' },
    { field: 'tags', label: 'Tags' },
    { field: 'liveUrl', label: 'Live URL' },
    { field: 'githubUrl', label: 'GitHub URL' },
  ]

  return fields
    .map(({ field, label }) => ({
      field,
      label,
      current: (current[field] ?? '').trim(),
      incoming: (incoming[field] ?? '').trim(),
    }))
    // An empty incoming value is "GitHub does not know", not "clear this".
    // Offering it would let a blank repo description wipe hand-written prose.
    .filter((row) => row.incoming !== '' && row.incoming !== row.current)
}
