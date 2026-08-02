import type { Inquiry } from '@prisma/client'
import { stripControlChars } from '@/lib/schemas/contact'
import { getSettings } from '@/lib/settings'

/**
 * Outbound notification for a new inquiry.
 *
 * Resend rather than SMTP, for a reason specific to this deployment: the app
 * runs on a self-hosted box behind Traefik and Cloudflare Tunnel, with no SPF
 * record, no DKIM key and no PTR. Mail originating there is spam-foldered or
 * refused, and outbound port 25 is blocked by most providers anyway. Resend is
 * an HTTPS POST to 443 — provably reachable, since the Whisper route already
 * calls the OpenAI API over it.
 *
 * Everything here is behind one function so swapping to nodemailer later means
 * editing this file and nothing else.
 */

export type MailResult =
  | { sent: true }
  | { sent: false; reason: 'unconfigured' | 'failed' }

const MAILER_KEYS = [
  'RESEND_API_KEY',
  'INQUIRY_NOTIFY_TO',
  'INQUIRY_NOTIFY_FROM',
] as const

/**
 * Async because these are now settings rather than environment variables — a
 * value typed into the dashboard has to take effect without a restart, and that
 * means a database read. `getSettings` caches for 30 seconds, so the contact
 * path does not pay for a query per submission.
 *
 * All three are required together. Two out of three is not a partially working
 * mailer, it is a misconfiguration that would fail at Resend after the inquiry
 * had already been saved — so it is reported as "not configured", which the
 * inbox already surfaces as a banner.
 */
export async function isMailerConfigured() {
  const settings = await getSettings(MAILER_KEYS)
  return MAILER_KEYS.every((key) => Boolean(settings[key]))
}

function renderInquiryText(inquiry: Inquiry) {
  const rows: [string, string | null][] = [
    ['From', `${inquiry.name} <${inquiry.email}>`],
    ['Company', inquiry.company],
    ['Reason', inquiry.reason],
    ['Project type', inquiry.projectType],
    ['Budget', inquiry.budget],
    ['Timeline', inquiry.timeline],
  ]

  const header = rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')

  return `${header}\n\n---\n\n${inquiry.message}\n`
}

/**
 * Never throws and never rejects.
 *
 * The caller deliberately does not await the result: the user's outcome
 * depends only on the database row existing, so a mail failure must not turn a
 * saved inquiry into an error the sender sees. Catching internally is what
 * makes the un-awaited call safe — an un-awaited rejecting promise would be an
 * unhandled rejection.
 */
export async function sendInquiryNotification(inquiry: Inquiry): Promise<MailResult> {
  // Read once and reused below, rather than calling isMailerConfigured() and
  // then re-resolving each value: two reads could straddle a settings change
  // and send with a key from before it and a from-address from after.
  const { RESEND_API_KEY, INQUIRY_NOTIFY_FROM, INQUIRY_NOTIFY_TO } =
    await getSettings(MAILER_KEYS)

  if (!RESEND_API_KEY || !INQUIRY_NOTIFY_FROM || !INQUIRY_NOTIFY_TO) {
    return { sent: false, reason: 'unconfigured' }
  }

  try {
    // Dynamic so the SDK is never loaded when the feature is switched off.
    const { Resend } = await import('resend')
    const resend = new Resend(RESEND_API_KEY)

    const who = stripControlChars(inquiry.name)
    const org = inquiry.company ? ` (${stripControlChars(inquiry.company)})` : ''

    await resend.emails.send({
      from: INQUIRY_NOTIFY_FROM,
      to: INQUIRY_NOTIFY_TO,
      // Replying goes straight to the human rather than to the from-address,
      // which is what makes the notification usable as an inbox.
      replyTo: inquiry.email,
      subject: `Portfolio inquiry — ${who}${org}`,
      // text/plain only. The message is user input; rendering it as HTML would
      // mean escaping it correctly forever.
      text: renderInquiryText(inquiry),
    })

    return { sent: true }
  } catch (error) {
    console.error('[mailer] inquiry notification failed', error)
    return { sent: false, reason: 'failed' }
  }
}
