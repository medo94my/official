import { revalidateTag, unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { Project, Service } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Server-side reads for the public site.
 *
 * The homepage calls these directly instead of fetching its own API routes
 * over HTTP — that pattern breaks during `next build` (no server is listening
 * yet) and costs a round trip at runtime.
 */

/** `tags` is a comma-separated column; every consumer wants an array. */
export function withTagArray(project: Project) {
  return {
    ...project,
    tags: project.tags ? project.tags.split(',').filter(Boolean) : [],
  }
}

export type ProjectWithTags = ReturnType<typeof withTagArray>

/**
 * A project as the public components see it.
 *
 * Narrower than `ProjectWithTags` by exactly the two timestamp columns, which
 * `getSiteContent` strips before caching. Components take this type so they
 * work with either reader, and so a component that starts rendering a date is
 * a compile error rather than a runtime one.
 */
export type PublicProject = Omit<ProjectWithTags, 'createdAt' | 'updatedAt'>

export async function getProjects() {
  const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } })
  return projects.map(withTagArray)
}

export async function getSkills() {
  return prisma.skill.findMany({ orderBy: { order: 'asc' } })
}

export async function getServices() {
  return prisma.service.findMany({ orderBy: { order: 'asc' } })
}

export async function getAbout() {
  return prisma.about.findFirst()
}

export async function getHero() {
  return prisma.hero.findFirst()
}

export async function getStats() {
  return prisma.stat.findMany({ orderBy: { order: 'asc' } })
}

/**
 * Employment history, newest first within the dashboard's own ordering.
 *
 * Ships empty and stays empty until real roles are entered — an invented job
 * is the one thing a portfolio cannot recover from. Every consumer renders
 * nothing while this returns [].
 */
export async function getExperience() {
  return prisma.experience.findMany({
    orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
  })
}

/**
 * Wrapped in React `cache` so `generateMetadata` and the page body share one
 * query per request instead of hitting Postgres twice for the same row.
 *
 * This matters beyond the round trip: the case-study route resolves the
 * project in `generateMetadata` specifically so it can call `notFound()`
 * before the response starts streaming — see the comment there.
 */
export const getProjectBySlug = cache(async (slug: string) => {
  const project = await prisma.project.findUnique({ where: { slug } })
  return project ? withTagArray(project) : null
})

/** The cache tag every public read shares. Mutating routes revalidate it. */
export const CONTENT_TAG = 'content'

type Dated = { createdAt?: unknown; updatedAt?: unknown }

/**
 * Drops the timestamp columns before a row crosses the cache boundary.
 *
 * `unstable_cache` persists through a serialisation step, so a `Date` written
 * into it does not come back as a `Date`. Rather than depend on exactly what
 * the serialiser does — and leave a `.toISOString is not a function` waiting
 * for whoever first renders a date on the homepage — the fields are removed,
 * and the return type says so. Anything that genuinely needs a timestamp calls
 * the uncached reader directly, which is what `app/sitemap.ts` does.
 */
function stripTimestamps<T extends Dated>(row: T) {
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row
  return rest
}

/**
 * One call so the page issues a single parallel round of queries rather than
 * awaiting each section in series.
 *
 * Cached for 60 seconds and tagged, which is a compromise between two real
 * costs. Uncached, every public page is seven queries per request and a bot
 * sweeping the site pays all of them; frozen at build time, an edit in the
 * dashboard would not appear until the container was rebuilt. Tagged caching
 * gets both: crawler traffic collapses to one round of queries a minute, and
 * every mutating route calls `revalidateContent()` so a real edit is visible
 * immediately.
 *
 * The 60s TTL is therefore a backstop, not the mechanism — it bounds how long
 * the site can be stale if a future route forgets to revalidate.
 */
export const getSiteContent = unstable_cache(
  async () => {
    const [projects, skills, services, about, hero, stats, experience] =
      await Promise.all([
        getProjects(),
        getSkills(),
        getServices(),
        getAbout(),
        getHero(),
        getStats(),
        getExperience(),
      ])

    // Arrow wrappers, not a bare reference: `.map(stripTimestamps)` would also
    // hand the callback the index and the array, and TypeScript resolves the
    // generic against those instead of the row.
    return {
      projects: projects.map((row) => stripTimestamps(row)),
      skills: skills.map((row) => stripTimestamps(row)),
      services: services.map((row) => stripTimestamps(row)),
      about: about ? stripTimestamps(about) : null,
      hero: hero ? stripTimestamps(hero) : null,
      stats: stats.map((row) => stripTimestamps(row)),
      experience: experience.map((row) => stripTimestamps(row)),
    }
  },
  ['site-content'],
  { revalidate: 60, tags: [CONTENT_TAG] }
)

/**
 * Called by every route that writes public content.
 *
 * Centralised so adding a model means adding one import rather than
 * remembering a magic string, and so the reason is written down once: without
 * this the owner edits a project, reloads the site, sees no change, and
 * reasonably concludes the save failed.
 */
export function revalidateContent() {
  revalidateTag(CONTENT_TAG)
}

/**
 * Featured entries first, then the dashboard's own order.
 *
 * Shared so the homepage showcase and the full /projects index cannot disagree
 * about which three are the top three.
 */
export function rankProjects<T extends { featured: boolean; order: number }>(projects: T[]) {
  return [...projects].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order
  )
}

/**
 * Parses the `specs` column into label/value rows.
 *
 * Stored as one "LABEL: value" per line so it stays editable in a plain
 * textarea. Lines without a colon are skipped rather than rendered half-empty.
 */
export function parseSpecs(specs?: string | null) {
  if (!specs) return []
  return specs
    .split('\n')
    .map((line) => {
      const idx = line.indexOf(':')
      if (idx < 1) return null
      const label = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (!label || !value) return null
      return { label, value }
    })
    .filter((row): row is { label: string; value: string } => row !== null)
}

/**
 * Splits a newline-delimited field into items.
 *
 * The companion to `parseSpecs` for fields that are a plain list rather than
 * label/value pairs. Blank and whitespace-only lines are dropped so a stray
 * trailing newline in a textarea does not render an empty bullet.
 */
export function parseLines(value?: string | null) {
  if (!value) return []
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Prose split on blank lines. A textarea's trailing newlines produce nothing. */
export function parseParagraphs(value?: string | null) {
  if (!value) return []
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export type CaseStudyBlockContent = {
  body?: string | null
  items?: string | null
  pairs?: string | null
}

/**
 * Whether a case-study block would render anything.
 *
 * `CaseStudyBlock` decides this for itself and returns null when the answer is
 * no, which is what makes thirteen optional fields cheap. The case-study page
 * needs the same answer *before* rendering, to build the scroll rail's ticks —
 * a tick pointing at a section that returned null is a tick pointing at
 * nothing. Both call this rather than each keeping its own idea of "empty",
 * because the two drifting apart is a bug nobody would notice until the rail
 * silently stopped lining up.
 */
export function hasBlockContent(block: CaseStudyBlockContent) {
  return (
    parseParagraphs(block.body).length > 0 ||
    parseLines(block.items).length > 0 ||
    parseSpecs(block.pairs).length > 0
  )
}

/**
 * Whether a project has enough written up to be worth its own page.
 *
 * Derived rather than stored, which is what makes "all thirteen fields empty"
 * a supported state rather than a special case: with nothing filled in this is
 * false, no detail link renders, and the project behaves exactly as it did
 * before the columns existed.
 */
export function hasCaseStudy(project: {
  problem?: string | null
  approach?: string | null
  outcome?: string | null
  context?: string | null
  myRole?: string | null
}) {
  return Boolean(
    project.problem ||
      project.approach ||
      project.outcome ||
      project.context ||
      project.myRole
  )
}

/**
 * Separates the two presentations of Service.
 *
 * One model, because the three seeded rows genuinely are both the engagement
 * offer and the process — a second table would duplicate them and let the two
 * drift. Rows default to "service", so this is a no-op until something is
 * explicitly marked as a process step.
 */
export function splitServices<T extends Pick<Service, 'kind'>>(services: T[]) {
  return {
    services: services.filter((s) => s.kind !== 'process'),
    process: services.filter((s) => s.kind === 'process'),
  }
}

/**
 * "2023-06" → "Jun 2023". A null end date means the role is current.
 *
 * Parsed by hand rather than through Date: constructing a Date from "2023-06"
 * pins it to UTC midnight on the 1st, which renders as May 2023 for anyone
 * west of UTC.
 */
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function formatMonth(value?: string | null) {
  if (!value) return 'Present'
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim())
  // Anything that isn't YYYY-MM is shown as typed rather than mangled.
  if (!match) return value
  const month = MONTHS[Number(match[2]) - 1]
  return month ? `${month} ${match[1]}` : value
}

/** Groups skills for the skills grid, preserving each category's first-seen order. */
export function groupSkillsByCategory<T extends { category: string }>(skills: T[]) {
  const grouped = new Map<string, T[]>()
  for (const skill of skills) {
    const existing = grouped.get(skill.category)
    if (existing) existing.push(skill)
    else grouped.set(skill.category, [skill])
  }
  return Array.from(grouped.entries())
}
