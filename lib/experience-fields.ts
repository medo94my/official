import { z } from 'zod'

/**
 * Validates and maps an experience request body.
 *
 * This is the first route with real validation, and it needs it: `startDate`
 * is a string column that the whole ordering and display layer assumes is
 * "YYYY-MM" or "YYYY". A value that does not match sorts wrong and renders
 * raw, so the shape is enforced at the boundary rather than hoped for.
 *
 * **A bare year is valid, and that is the point.** A CV commonly gives month
 * precision for recent roles and only a year for older ones. Demanding
 * YYYY-MM everywhere would force whoever enters it to pick a month the CV
 * never stated — inventing a date to satisfy a regex, which is exactly the
 * kind of quiet fabrication this project refuses everywhere else. Both forms
 * still sort correctly as plain strings: "2022" falls immediately before
 * "2022-01", which is the right place for an unspecified month in that year.
 */
const MONTH_OR_YEAR = /^\d{4}(-(0[1-9]|1[0-2]))?$/
const DATE_HINT = 'Use YYYY-MM (2023-06) or just YYYY (2023) if the month is not known'

export const experienceSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(120),
  role: z.string().trim().min(1, 'Role is required').max(120),
  startDate: z.string().trim().regex(MONTH_OR_YEAR, DATE_HINT),
  // Empty string is how a cleared date field reports itself, and here that
  // legitimately means "current role".
  endDate: z
    .string()
    .trim()
    .regex(MONTH_OR_YEAR, DATE_HINT)
    .optional()
    .or(z.literal('').transform(() => undefined))
    .nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  summary: z.string().trim().max(2000).optional().nullable(),
  highlights: z.string().trim().max(4000).optional().nullable(),
  url: z
    .string()
    .trim()
    .url('Must be a full URL, including https://')
    .optional()
    .or(z.literal('').transform(() => undefined))
    .nullable(),
  order: z.coerce.number().int().min(0).default(0),
})

/** Throws ZodError, which handleApiError turns into a 400 with field errors. */
export function experienceFields(body: unknown) {
  const parsed = experienceSchema.parse(body)

  return {
    company: parsed.company,
    role: parsed.role,
    startDate: parsed.startDate,
    endDate: parsed.endDate || null,
    location: parsed.location || null,
    summary: parsed.summary || null,
    highlights: parsed.highlights || null,
    url: parsed.url || null,
    order: parsed.order,
  }
}
