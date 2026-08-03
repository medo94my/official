import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, UnauthorizedError } from '@/lib/auth'
import {
  MODEL_ROLES,
  OpenRouterError,
  modelsForRole,
  type ModelRole,
} from '@/lib/openrouter'

/**
 * The OpenRouter catalogue, filtered to one role, for the Settings dropdowns.
 *
 * Admin-only even though the upstream catalogue is public: this endpoint exists
 * to serve one authenticated screen, and leaving it open would make the site a
 * free proxy for anyone who found the path.
 *
 * A read. It must never call `contentChanged()`.
 */
export const dynamic = 'force-dynamic'

const VALID_ROLES = new Set(MODEL_ROLES.map((r) => r.role))

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const role = request.nextUrl.searchParams.get('role') ?? ''
    if (!VALID_ROLES.has(role as ModelRole)) {
      return NextResponse.json(
        { error: `Unknown model role. Expected one of: ${[...VALID_ROLES].join(', ')}.` },
        { status: 400 }
      )
    }

    const refresh = request.nextUrl.searchParams.get('refresh') === '1'
    const models = await modelsForRole(role as ModelRole, { refresh })

    return NextResponse.json(
      { role, models },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Same reasoning as the GitHub route: the only reader is the owner, and the
    // message is what tells them whether to fix a key or pick another model.
    if (error instanceof OpenRouterError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[models]', error)
    return NextResponse.json({ error: 'Could not reach OpenRouter.' }, { status: 502 })
  }
}
