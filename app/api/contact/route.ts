import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendInquiryNotification } from '@/lib/mailer'
import { checkInquiryRateLimit, hashIp } from '@/lib/rate-limit'
import { MIN_DWELL_MS, contactSchema, stripControlChars } from '@/lib/schemas/contact'

// Prisma and node:crypto, and never cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Silent success. Nothing is written; the sender is told nothing is wrong. */
const accepted = () => NextResponse.json({ ok: true })

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, code: 'malformed' }, { status: 400 })
  }

  let values
  try {
    values = contactSchema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, code: 'invalid', fieldErrors: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    throw error
  }

  // ── Spam gates ────────────────────────────────────────────────────────
  // Both return 200 and write nothing. A 4xx here would tell whoever is
  // probing which field is the trap and how fast is fast enough; silence
  // tells them the submission worked and gives them no signal to tune against.
  if (values.fax) return accepted()
  if (values.elapsedMs !== undefined && values.elapsedMs < MIN_DWELL_MS) return accepted()

  const ipHash = hashIp(request)

  const limit = await checkInquiryRateLimit(ipHash)
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, code: 'rate_limited', retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  let inquiry
  try {
    inquiry = await prisma.inquiry.create({
      data: {
        // Single-line fields are stripped of control characters before storage
        // because they end up in the notification's subject line, where a bare
        // CR or LF is a header-injection vector.
        name: stripControlChars(values.name),
        email: values.email,
        company: values.company ? stripControlChars(values.company) : null,
        reason: values.reason,
        projectType: values.projectType ?? null,
        budget: values.budget ? stripControlChars(values.budget) : null,
        timeline: values.timeline ? stripControlChars(values.timeline) : null,
        // The message keeps its newlines: it is sent as text/plain and is
        // never interpolated into a header.
        message: values.message,
        ipHash,
        userAgent: request.headers.get('user-agent')?.slice(0, 255) ?? null,
      },
    })
  } catch (error) {
    console.error('[contact] failed to save inquiry', error)
    return NextResponse.json({ ok: false, code: 'server_error' }, { status: 500 })
  }

  // Deliberately not awaited. The contract with the sender is that their
  // message is recorded — which it now is. Blocking the response on an
  // external API would make a Resend outage look like a broken form, and
  // `sendInquiryNotification` catches internally so this cannot become an
  // unhandled rejection. Safe here because `output: 'standalone'` runs a
  // long-lived Node process rather than a function that freezes on return.
  void sendInquiryNotification(inquiry)

  return NextResponse.json({ ok: true })
}
