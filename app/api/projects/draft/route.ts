import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import {
  GithubError,
  fetchReadme,
  fetchTree,
  getGithubToken,
  listRepos,
} from '@/lib/github'
import { OpenRouterError, chatJson, getRoleModel } from '@/lib/openrouter'
import { repoIdentity } from '@/lib/repo-import'
import {
  assessEvidence,
  buildDraftPrompt,
  parseDraftResponse,
  type RepoEvidence,
} from '@/lib/case-study-draft'

/**
 * Drafts case-study fields for one project from its repository.
 *
 * **Read-only.** It touches no Prisma model and must never call
 * `contentChanged()` — the draft is applied field by field in the form and saved
 * through the existing `PUT /api/projects/[id]`, which is what keeps the review
 * step, the 409 handling and the cache invalidation in one place.
 *
 * `force-dynamic` and `no-store` for the same reason as the repository list: the
 * body can contain the contents of a private README.
 *
 * This sits beside `[id]/route.ts`. A static segment wins over a dynamic one in
 * the App Router, so `/api/projects/draft` resolves here and never reaches the
 * project handler — and since ids are cuids, no real project can be shadowed.
 */
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = (await request.json().catch(() => ({}))) as { githubUrl?: unknown }
    const identity = repoIdentity(
      typeof body.githubUrl === 'string' ? body.githubUrl : null
    )
    if (!identity) {
      return NextResponse.json(
        { error: 'That project has no GitHub URL to draft from.' },
        { status: 400 }
      )
    }

    const model = await getRoleModel('text')
    if (!model) {
      return NextResponse.json(
        { error: 'No text model chosen. Pick one in Settings → Models.' },
        { status: 503 }
      )
    }

    const token = await getGithubToken()

    // Metadata comes from the cached repository list rather than a fresh call:
    // the picker has almost always populated it already, and a repo that is not
    // in the list can still be drafted from its README.
    const known = await listRepos()
      .then((r) => r.repos.find((repo) => repoIdentity(repo.htmlUrl) === identity))
      .catch(() => undefined)

    const [readme, tree] = await Promise.all([
      fetchReadme(identity, token),
      fetchTree(identity, token),
    ])

    const evidence: RepoEvidence = {
      fullName: known?.fullName ?? identity,
      description: known?.description ?? null,
      language: known?.language ?? null,
      topics: known?.topics ?? [],
      readme,
      tree,
      isPrivate: known?.isPrivate ?? false,
    }

    const verdict = assessEvidence(evidence)
    if (!verdict.sufficient) {
      // 422, not 400: the request was well-formed and the repository was found.
      // What failed is that there is not enough there to write from, and that is
      // a legitimate outcome the owner needs stated rather than an error.
      return NextResponse.json(
        { error: verdict.reason, insufficientEvidence: true },
        { status: 422, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const { system, user } = buildDraftPrompt(evidence)
    const raw = await chatJson<unknown>({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      maxTokens: 2000,
      // Low, not zero: this is summarisation of supplied text, where creativity
      // is the failure mode rather than the point.
      temperature: 0.2,
    })

    const result = parseDraftResponse(raw)

    return NextResponse.json(
      {
        ...result,
        repo: evidence.fullName,
        isPrivate: evidence.isPrivate,
        model,
        readmeWords: verdict.readmeWords,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof GithubError || error instanceof OpenRouterError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[draft]', error)
    return NextResponse.json({ error: 'Could not draft from that repository.' }, { status: 500 })
  }
}
