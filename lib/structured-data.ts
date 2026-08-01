import { absoluteUrl, SITE_URL } from './site'
import type { ProjectWithTags } from './content'

/**
 * Builders for the JSON-LD emitted by the public pages.
 *
 * Kept out of the components so the shape of each claim is reviewable in one
 * place, and so nothing can quietly add a field that the database does not
 * back. `JsonLd` prunes empties, so passing `undefined` is the correct way to
 * say "not known" — there is no need to branch at the call site.
 */

type AboutLike = {
  name?: string | null
  title?: string | null
  bio?: string | null
  email?: string | null
  location?: string | null
  github?: string | null
  linkedin?: string | null
  twitter?: string | null
  avatar?: string | null
} | null

const PERSON_ID = `${SITE_URL}/#person`
const SITE_ID = `${SITE_URL}/#website`

/**
 * The person the site is about.
 *
 * `sameAs` is the load-bearing part: it is how a search engine connects this
 * page to the GitHub and LinkedIn profiles rather than guessing. Only profiles
 * actually stored are listed — an unverified handle here is a claim about
 * someone's identity.
 *
 * No `worksFor`, no `alumniOf`, no `award`. Those are employment and
 * credential claims, and the Experience table is empty by design.
 */
export function personSchema(about: AboutLike, fallbackName: string) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: about?.name || fallbackName,
    jobTitle: about?.title || undefined,
    description: about?.bio?.split(/\n\s*\n/)[0]?.trim() || undefined,
    url: absoluteUrl('/'),
    email: about?.email ? `mailto:${about.email}` : undefined,
    image: about?.avatar || undefined,
    // A plain string, not a PostalAddress: the record holds "Istanbul, Turkey"
    // and splitting that into locality/country would be inference, not data.
    address: about?.location || undefined,
    sameAs: [about?.github, about?.linkedin, about?.twitter].filter(Boolean),
  }
}

export function websiteSchema(about: AboutLike, fallbackName: string) {
  const name = about?.name || fallbackName
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: absoluteUrl('/'),
    name: `${name} — Portfolio`,
    inLanguage: 'en',
    // The site is the person's, and the person node is right beside it in the
    // same graph, so this is a reference rather than a duplicate object.
    publisher: { '@id': PERSON_ID },
  }
}

/**
 * One project, as a `CreativeWork`.
 *
 * `SoftwareSourceCode` was the tempting choice and is wrong for most of these:
 * it describes a code artefact, and several projects here are deployed
 * products whose source is private. `CreativeWork` is the honest supertype.
 *
 * Emitted only when there is a write-up to read — see the note in JsonLd.tsx.
 */
export function projectSchema(
  project: ProjectWithTags,
  about: AboutLike,
  fallbackName: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`/projects/${project.slug}#work`),
    name: project.title,
    description: project.description,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: project.image || undefined,
    keywords: project.tags.length > 0 ? project.tags.join(', ') : undefined,
    dateModified: project.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: about?.name || fallbackName,
    },
    isPartOf: { '@id': SITE_ID },
  }
}

/** The homepage graph: one document, two linked nodes. */
export function homeSchema(about: AboutLike, fallbackName: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [personSchema(about, fallbackName), websiteSchema(about, fallbackName)],
  }
}
