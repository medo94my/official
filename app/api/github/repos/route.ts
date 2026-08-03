import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import { UPSTREAM_FAILED } from '@/lib/http'
import { GithubError, listRepos } from '@/lib/github'

/**
 * The owner's repositories, for the project importer.
 *
 * `force-dynamic` and `no-store` are load-bearing rather than boilerplate: the
 * body can contain private repository names, and a statically emitted copy of
 * that in `.next` would be a real leak.
 *
 * A read, so it must never call `contentChanged()` — blowing the public site
 * cache every time someone opens the picker would be pure waste.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const refresh = request.nextUrl.searchParams.get('refresh') === '1'
    return NextResponse.json(await listRepos({ refresh }), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Deliberately not handleApiError: that function hides detail on purpose,
    // and here the only person who can see the message is the owner — the
    // message *is* the feature. Which token to fix, which permission is
    // missing, when the rate limit resets.
    if (error instanceof GithubError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[github]', error)
    return NextResponse.json({ error: 'Could not reach GitHub.' }, { status: UPSTREAM_FAILED })
  }
}
