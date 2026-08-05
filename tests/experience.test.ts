import { ok, section } from './harness'
import { experienceFields, experienceSchema } from '@/lib/experience-fields'
import { formatMonth } from '@/lib/dates'

/**
 * A CV states month precision for recent roles and often only a year for older
 * ones. Every assertion here exists to stop a month being invented to satisfy
 * a regex — the same rule that governs employers, metrics and job titles.
 */

const base = { company: 'Acme', role: 'Engineer' }

section('experienceSchema accepts both precisions')
ok('YYYY-MM start', experienceSchema.safeParse({ ...base, startDate: '2025-03' }).success)
ok('bare year start', experienceSchema.safeParse({ ...base, startDate: '2022' }).success)
ok('bare year end', experienceSchema.safeParse({ ...base, startDate: '2020', endDate: '2022' }).success)
ok(
  'a mixed pair is fine — the CV itself is mixed',
  experienceSchema.safeParse({ ...base, startDate: '2025-03', endDate: '2026' }).success,
)

section('experienceSchema still rejects what it always did')
ok('month 00', !experienceSchema.safeParse({ ...base, startDate: '2022-00' }).success)
ok('month 13', !experienceSchema.safeParse({ ...base, startDate: '2022-13' }).success)
ok('two-digit year', !experienceSchema.safeParse({ ...base, startDate: '22' }).success)
ok('five-digit year', !experienceSchema.safeParse({ ...base, startDate: '20222' }).success)
ok('a full date', !experienceSchema.safeParse({ ...base, startDate: '2022-06-01' }).success)
ok('free text', !experienceSchema.safeParse({ ...base, startDate: 'March 2025' }).success)
ok('empty start', !experienceSchema.safeParse({ ...base, startDate: '' }).success)

section('experienceFields')
ok(
  'a blank end date means current, not an empty string',
  experienceFields({ ...base, startDate: '2025-03', endDate: '' }).endDate === null,
)
ok(
  'a year-only start survives the mapping unchanged',
  experienceFields({ ...base, startDate: '2022' }).startDate === '2022',
)

section('formatMonth')
ok('YYYY-MM becomes a named month', formatMonth('2025-03') === 'Mar 2025')
ok('a bare year stays a bare year', formatMonth('2022') === '2022')
ok('a bare year is never given a month', !/Jan/.test(formatMonth('2022')))
ok('null is Present', formatMonth(null) === 'Present')
ok('empty is Present', formatMonth('') === 'Present')
ok('December is not off by one', formatMonth('2024-12') === 'Dec 2024')
ok('January is not off by one', formatMonth('2024-01') === 'Jan 2024')
ok('unparseable input is shown as typed', formatMonth('whenever') === 'whenever')

section('ordering is still correct as plain strings')
// The list is ordered by startDate descending, so string comparison has to put
// these in real chronological order without parsing anything.
const sorted = ['2020', '2022', '2025-03', '2022-06'].sort().reverse()
ok('newest first', sorted[0] === '2025-03', sorted.join(' '))
ok('oldest last', sorted[sorted.length - 1] === '2020', sorted.join(' '))
ok(
  'an unspecified month sorts just before January of its year',
  ['2022-01', '2022'].sort()[0] === '2022',
)
