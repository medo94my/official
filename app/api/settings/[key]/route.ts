import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api'
import { clearSetting, getSettingsStatus, isKnownSetting } from '@/lib/settings'

export const dynamic = 'force-dynamic'

/**
 * Removes a stored override so the environment variable applies again.
 *
 * A separate verb from writing an empty string on purpose: "stop overriding
 * this" and "set this to nothing" are different intentions, and collapsing them
 * would make it impossible to fall back to .env once a value had been typed.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { key: string } }
) {
  try {
    await requireAuth()

    if (!isKnownSetting(params.key)) {
      return NextResponse.json({ error: 'Unknown setting' }, { status: 404 })
    }

    await clearSetting(params.key)
    return NextResponse.json(await getSettingsStatus())
  } catch (error) {
    return handleApiError(error)
  }
}
