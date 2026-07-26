import type { Project } from '@prisma/client'
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
 * One call so the page issues a single parallel round of queries rather than
 * awaiting each section in series.
 */
export async function getSiteContent() {
  const [projects, skills, services, about, hero, stats] = await Promise.all([
    getProjects(),
    getSkills(),
    getServices(),
    getAbout(),
    getHero(),
    getStats(),
  ])

  return { projects, skills, services, about, hero, stats }
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
