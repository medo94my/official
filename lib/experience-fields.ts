import { z } from 'zod'

/**
 * Validates and maps an experience request body.
 *
 * This is the first route with real validation, and it needs it: `startDate`
 * is a string column that the whole ordering and display layer assumes is
 * "YYYY-MM". A value that does not match sorts wrong and renders raw, so the
 * shape is enforced at the boundary rather than hoped for.
 */
export const experienceSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(120),
  role: z.string().trim().min(1, 'Role is required').max(120),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM, e.g. 2023-06'),
  // Empty string is how an <input type="month"> reports "cleared", and here
  // that legitimately means "current role".
  endDate: z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM, e.g. 2025-03')
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
