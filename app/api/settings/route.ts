import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/api'
import { getSettingsStatus, isKnownSetting, writeSetting } from '@/lib/settings'

/**
 * Application configuration.
 *
 * Admin-only in both directions. The GET deliberately returns a *status* view
 * rather than the values: a secret's plaintext has no reason to reach the
 * browser, and sending it would put every API key into page HTML, the browser
 * cache, and any screenshot of the settings screen. The form does not need the
 * current value in order to accept a replacement.
 *
 * No `contentChanged()` anywhere in this file. Settings are not public site
 * content, and busting the whole public cache because someone pasted an API key
 * would be pure waste.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAuth()
    return NextResponse.json(await getSettingsStatus(), {
      // Belt and braces alongside force-dynamic: the response describes which
      // integrations are configured, which is not something to leave sitting in
      // an intermediary.
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Accepts a partial map of key → value. An empty string clears the override so
 * the environment variable applies again — see `clearSetting` for why that is
 * distinct from storing an empty value.
 */
const updateSchema = z
  .record(z.string(), z.string().max(4000))
  .refine((body) => Object.keys(body).length > 0, 'No settings supplied')
  .refine(
    (body) => Object.keys(body).every(isKnownSetting),
    'Contains a setting this application does not recognise'
  )

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()

    const updates = updateSchema.parse(await request.json())

    // Sequential rather than Promise.all: these are a handful of upserts and a
    // partial failure should stop at the first problem with the remaining
    // fields untouched, rather than leaving a scattered half-applied state.
    for (const [key, value] of Object.entries(updates)) {
      await writeSetting(key, value)
    }

    // The fresh status is returned so the form re-renders from the server's
    // view rather than optimistically from what was typed — which is how a
    // failed write would otherwise look like a successful one.
    return NextResponse.json(await getSettingsStatus())
  } catch (error) {
    // A missing SETTINGS_KEY surfaces here as a plain Error. It is the one
    // message on this screen the operator has to act on, so it is passed
    // through rather than flattened into "Server error".
    if (error instanceof Error && error.message.includes('SETTINGS_KEY')) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return handleApiError(error)
  }
}
