/**
 * Date formatting for CV entries. Pure, and deliberately in its own module.
 *
 * This lived in `lib/content.ts`, which imports React's `cache` and Prisma, so
 * a plain-node test could not reach it — and the admin dashboard therefore
 * carried a hand-copied duplicate marked "mirrors formatMonth in
 * lib/content.ts". Two copies of a formatter is one copy that will be wrong:
 * the year-only rule below was added to one of them and would have silently
 * left the dashboard printing "Jan 2022" for a role the CV dates as "2022".
 */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * "2023-06" → "Jun 2023", "2022" → "2022", nothing → "Present".
 *
 * Formatted by hand rather than through `Date`, because `new Date('2023-06')`
 * is midnight UTC and renders as May west of Greenwich — a whole month wrong
 * for half the planet, on a CV.
 */
export function formatMonth(value?: string | null) {
  if (!value) return 'Present'
  const trimmed = value.trim()
  // A bare year stays a bare year. Rendering "Jan 2022" for a CV that says
  // "2022" would state a month the CV never claimed — and January is the one
  // a naive parser always invents, so it would be both wrong and plausible.
  if (/^\d{4}$/.test(trimmed)) return trimmed
  const match = /^(\d{4})-(\d{2})$/.exec(trimmed)
  // Anything else is shown as typed rather than mangled.
  if (!match) return value
  const month = MONTHS[Number(match[2]) - 1]
  return month ? `${month} ${match[1]}` : value
}
