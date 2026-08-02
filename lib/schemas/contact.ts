import { z } from 'zod'

/**
 * The contact form's shape, shared by the client form and the route handler.
 *
 * One schema, two consumers: the browser gets field-level errors before a
 * request is made, and the server re-validates because client-side validation
 * is a convenience, never a control.
 */

export const REASONS = [
  { value: 'hire', label: 'A role at my company' },
  { value: 'project', label: 'A project to build' },
  { value: 'consult', label: 'Advice or a second opinion' },
  { value: 'other', label: 'Something else' },
] as const

export const PROJECT_TYPES = [
  { value: 'web', label: 'Web application' },
  { value: 'automation', label: 'Automation or scraping' },
  { value: 'api', label: 'API or integration' },
  { value: 'existing', label: 'Work on something that exists' },
  { value: 'other', label: 'Not sure yet' },
] as const

const reasonValues = REASONS.map((r) => r.value) as [string, ...string[]]
const projectTypeValues = PROJECT_TYPES.map((p) => p.value) as [string, ...string[]]

/** An untouched <select> or a cleared <input> both submit ''. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? undefined : v))

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please give your name').max(100),
  email: z.string().trim().toLowerCase().email('That email address looks wrong').max(200),
  company: optionalText(120),
  reason: z.enum(reasonValues).default('other'),
  projectType: z.enum(projectTypeValues).optional().or(z.literal('').transform(() => undefined)),
  budget: optionalText(60),
  timeline: optionalText(60),
  message: z
    .string()
    .trim()
    .min(20, 'A sentence or two about what you need')
    .max(5000, 'That is longer than this form takes — email me directly'),

  // ── Spam gates. Neither is a control on its own; both are free. ────────
  /**
   * Honeypot. Named `fax` rather than the usual `website` or `company`,
   * because both of those are real fields here and a bot filling them in
   * would be indistinguishable from a person.
   *
   * Accepts ANY string. It must not be `.max(0)`: that makes a filled
   * honeypot a validation failure, and the route would answer 400 —
   * telling whoever is probing exactly which field is the trap. The route
   * inspects this after parsing and answers 200 either way.
   */
  fax: z.string().optional(),
  /**
   * Milliseconds since the form mounted. Unsigned on purpose — the worst case
   * if forged is that a bot reaches the rate limiter, which is the real
   * control. Signing it would cost an HMAC round trip to protect a speed bump.
   */
  elapsedMs: z.coerce.number().int().nonnegative().optional(),
})

export type ContactInput = z.input<typeof contactSchema>
export type ContactValues = z.output<typeof contactSchema>

/** A human filling in eight fields takes longer than this. */
export const MIN_DWELL_MS = 2500

/**
 * Removes control characters from single-line values.
 *
 * These are interpolated into the notification email's subject line, where a
 * bare CR or LF is a header-injection vector. The message body keeps its
 * newlines — it is sent as text/plain and never interpolated into headers.
 */
export function stripControlChars(value: string) {
  // eslint-disable-next-line no-control-regex
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
