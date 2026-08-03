import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import type { RepoSummary } from '@/lib/repo-import'

/**
 * Reading the owner's repositories from GitHub.
 *
 * Server-only. The token must never reach the browser, which is why the route
 * that uses this returns normalised summaries rather than proxying GitHub.
 *
 * Plain `fetch`, not octokit: this is one endpoint and one error mapping, and
 * the rate-limit handling has to be bespoke anyway because it is surfaced in
 * the UI. Octokit would add roughly 1.5 MB to do a fetch with three headers.
 */

const API = 'https://api.github.com'
const PER_PAGE = 100
/**
 * Authenticated only. The account this was built for has 116 repositories and
 * the private one the owner most wanted is number 102 by last-pushed, so a
 * single page would have hidden exactly the repo the token was added for.
 * Two pages costs 2 of 5,000 requests an hour.
 */
const MAX_PAGES = 3

export class GithubError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'GithubError'
  }
}

/**
 * The owner login from the About record's GitHub link.
 *
 * That field is free text with a placeholder, not a validated column, so it
 * arrives as a full URL, a bare handle, an @handle, or a link to one repo.
 * Anything that does not reduce to a plausible login is treated as unset rather
 * than sent to GitHub, where it would come back as a 404 the owner cannot act
 * on.
 */
export function loginFromProfileUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const raw = value.trim()
  let candidate = raw

  try {
    const parsed = new URL(raw)
    candidate = parsed.pathname.split('/').filter(Boolean)[0] ?? ''
  } catch {
    candidate = raw.replace(/^@/, '').split('/').filter(Boolean)[0] ?? ''
  }

  candidate = candidate.replace(/^@/, '')
  // GitHub's own reserved first path segments, which are never usernames.
  if (['orgs', 'settings', 'sponsors', 'search', 'topics', 'explore'].includes(candidate)) {
    return null
  }
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(candidate) ? candidate : null
}

/** The configured token, or undefined for the unauthenticated public path. */
export async function getGithubToken(): Promise<string | undefined> {
  return (await getSetting('GITHUB_TOKEN'))?.trim() || undefined
}

type RawRepo = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  topics?: string[]
  language: string | null
  private: boolean
  fork: boolean
  archived: boolean
  stargazers_count: number
  pushed_at: string
}

/**
 * Twelve fields, not the raw object.
 *
 * A GitHub repo payload is ~4 KB of mostly URL templates, and for private repos
 * it carries a `permissions` block and the full owner record — none of which
 * the browser has any use for, and some of which it should not see.
 *
 * `pushed_at` stays an ISO string the whole way to the client. Nothing in this
 * path constructs a Date, deliberately: the cached value below would not
 * survive one, and the same discipline is why lib/content.ts strips timestamps
 * before caching.
 */
function normalise(repo: RawRepo): RepoSummary {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    htmlUrl: repo.html_url,
    homepage: repo.homepage,
    topics: repo.topics ?? [],
    language: repo.language,
    isPrivate: repo.private,
    isFork: repo.fork,
    isArchived: repo.archived,
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
  }
}

function describeFailure(response: Response): GithubError {
  const remaining = response.headers.get('x-ratelimit-remaining')

  // GitHub answers 403, not 429, when the primary rate limit is exhausted.
  // Branching on status alone sends the owner hunting a permissions problem
  // that does not exist, so the remaining-count is what decides.
  if ((response.status === 403 || response.status === 429) && remaining === '0') {
    const reset = Number(response.headers.get('x-ratelimit-reset'))
    const when = Number.isFinite(reset)
      ? new Date(reset * 1000).toISOString().slice(11, 16) + ' UTC'
      : 'shortly'
    return new GithubError(`GitHub's rate limit is used up. Try again after ${when}.`, 429)
  }

  if (response.status === 401) {
    return new GithubError(
      'GitHub rejected the token. Check it has not expired, in Settings.',
      502
    )
  }
  if (response.status === 403) {
    return new GithubError(
      'GitHub refused the request. A fine-grained token needs Repository permissions → Metadata: read.',
      502
    )
  }
  if (response.status === 404) {
    return new GithubError(
      'GitHub has no such account. Check the GitHub URL on the About screen.',
      404
    )
  }
  return new GithubError(`GitHub returned ${response.status}.`, 502)
}

async function request(
  url: string,
  token: string | undefined,
  accept = 'application/vnd.github+json'
): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Accept: accept,
        'X-GitHub-Api-Version': '2022-11-28',
        // Without a User-Agent GitHub answers 403 with a body that reads like a
        // permissions problem. Hours of debugging live in that gap.
        'User-Agent': 'portfolio-cms',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Next's fetch caches by default in some contexts. A silently cached
      // private repository list is not something to leave to a default.
      cache: 'no-store',
      // Without a deadline a network partition holds the admin request open
      // until the platform kills it, and the picker just spins.
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new GithubError('Could not reach GitHub.', 502)
  }

  return response
}

async function fetchPage(url: string, token: string | undefined): Promise<RawRepo[]> {
  const response = await request(url, token)
  if (!response.ok) throw describeFailure(response)
  return (await response.json()) as RawRepo[]
}

/**
 * The README as markdown, or null when the repository has none.
 *
 * `application/vnd.github.raw` returns the file itself rather than a JSON
 * envelope with base64 in it — one fewer decode step, and no chance of the
 * content field being truncated on a large file.
 *
 * A 404 is a real answer here, not a failure: two of the six repositories this
 * was built against have no README at all, and the drafter needs to say so
 * rather than surface an error the owner cannot act on.
 */
export async function fetchReadme(
  fullName: string,
  token: string | undefined
): Promise<string | null> {
  const response = await request(
    `${API}/repos/${fullName}/readme`,
    token,
    'application/vnd.github.raw'
  )
  if (response.status === 404) return null
  if (!response.ok) throw describeFailure(response)
  return await response.text()
}

type RawTree = {
  tree?: { path: string; type: string }[]
  truncated?: boolean
}

/**
 * Blob paths from the default branch.
 *
 * Two calls, not one: the tree endpoint needs a ref, and the default branch is
 * not always `main` — `game-dev` and `E-commerce_front_end` are both `master`.
 * Hardcoding either would 404 on half the account.
 *
 * A failure returns an empty list rather than throwing. The tree is supplementary
 * evidence; losing it degrades the draft, whereas losing the README makes it
 * impossible, and taking the whole feature down over the lesser of the two would
 * be the wrong trade.
 */
export async function fetchTree(
  fullName: string,
  token: string | undefined
): Promise<string[]> {
  try {
    const repoResponse = await request(`${API}/repos/${fullName}`, token)
    if (!repoResponse.ok) return []
    const { default_branch: branch } = (await repoResponse.json()) as {
      default_branch?: string
    }
    if (!branch) return []

    const treeResponse = await request(
      `${API}/repos/${fullName}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      token
    )
    if (!treeResponse.ok) return []

    const body = (await treeResponse.json()) as RawTree
    return (body.tree ?? []).filter((e) => e.type === 'blob').map((e) => e.path)
  } catch {
    return []
  }
}

export type RepoListResult = {
  login: string | null
  authenticated: boolean
  truncated: boolean
  fetchedAt: string
  repos: RepoSummary[]
}

/**
 * Successful results only, for five minutes.
 *
 * Caching a failure would lock the picker for the whole window after one
 * transient DNS blip, with no way out but waiting — and the Refresh button
 * exists precisely so a repository pushed a minute ago can be found now.
 *
 * Process-local rather than `unstable_cache`: that is this codebase's *public
 * render* cache, and private repository names are neither public nor site
 * content. Mixing them in would invite someone to later assume
 * `revalidateTag('content')` covers them.
 */
let cached: { key: string; expiresAt: number; value: RepoListResult } | null = null
const TTL_MS = 5 * 60_000

export async function listRepos({ refresh = false } = {}): Promise<RepoListResult> {
  const token = await getGithubToken()

  // Read directly rather than through getSiteContent(): that cache exists to
  // collapse seven queries for a public page render, and coupling this to the
  // content tag buys nothing.
  const about = await prisma.about.findFirst({ select: { github: true } }).catch(() => null)
  const login = loginFromProfileUrl(about?.github)

  if (!token && !login) {
    throw new GithubError(
      'No GitHub account configured. Add a GitHub token in Settings, or set your GitHub profile URL on the About screen.',
      503
    )
  }

  const key = `${login ?? 'token'}:${Boolean(token)}`
  if (!refresh && cached?.key === key && Date.now() < cached.expiresAt) {
    return cached.value
  }

  const repos: RepoSummary[] = []
  let truncated = false

  // Unauthenticated the budget is 60 requests an hour for the whole host, so
  // paging would spend a meaningful fraction of it every time the picker opens.
  // With a token it is 5,000 and the pages are effectively free.
  const maxPages = token ? MAX_PAGES : 1

  for (let page = 1; page <= maxPages; page++) {
    const url = token
      ? `${API}/user/repos?visibility=all&affiliation=owner&sort=updated&per_page=${PER_PAGE}&page=${page}`
      : `${API}/users/${login}/repos?type=owner&sort=updated&per_page=${PER_PAGE}&page=${page}`

    const batch = await fetchPage(url, token)
    repos.push(...batch.map(normalise))

    if (batch.length < PER_PAGE) break
    if (page === maxPages) truncated = true
  }

  const value: RepoListResult = {
    login: login ?? repos[0]?.fullName.split('/')[0] ?? null,
    authenticated: Boolean(token),
    truncated,
    fetchedAt: new Date().toISOString(),
    repos,
  }

  cached = { key, expiresAt: Date.now() + TTL_MS, value }
  return value
}
