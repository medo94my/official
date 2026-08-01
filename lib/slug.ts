/**
 * URL segment from a project title.
 *
 * This must stay equivalent to the SQL in
 * `prisma/migrations/20260726230000_add_case_study_experience_inquiry/migration.sql`,
 * which backfilled the existing rows:
 *
 *   trim(BOTH '-' FROM regexp_replace(
 *     regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), '-{2,}', '-', 'g'))
 *
 * If the two drift, slugs created in the dashboard stop matching the seeded
 * ones and a project's URL silently changes under it.
 *
 * Note the character class is ASCII-only on both sides. "Martify — Online
 * Grocery" becomes `martify-online-grocery`: the em dash is a non-matching
 * character, so it collapses into the separator rather than being transliterated.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}
