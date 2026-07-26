import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

/**
 * Seeds the portfolio content.
 *
 * Idempotent: every write is an upsert keyed on a stable field, so running it
 * twice produces the same rows rather than duplicating them.
 *
 * Link policy: nothing dead ships. The old data pointed at three Heroku demos
 * (shut down with the free tier in Nov 2022) and two GitHub repos that do not
 * exist (medo94my/undertesting, medo94my/wasi-furom). Those are gone rather
 * than kept as 404s.
 */

// Stable ids for the singleton rows so upsert has something to key on.
const ABOUT_ID = 'default-about'
const HERO_ID = 'default-hero'

const ABOUT = {
  name: 'Ahmet Yilmaz',
  title: 'Full-Stack Developer',
  bio:
    'Full-stack developer building web applications end to end — Python (Flask, Django), ' +
    'PHP (Laravel) and TypeScript on the server, React and Next.js on the front end. ' +
    'Recent work centres on browser automation, scraping pipelines and developer tooling.',
  email: 'medoroyalrma@gmail.com',
  // TODO(owner): confirm — this is a Malaysian number but the location is Istanbul.
  phone: '+601111884535',
  // `whatsapp` is deliberately absent: seeding an unconfirmed number would put
  // a live "chat with me" button in front of visitors. Set it in the dashboard
  // (About → WhatsApp) and the button appears. Omitting it here also means a
  // re-seed leaves whatever you set alone.
  // City only. The previous value was a full street address, which does not
  // belong on a public page.
  location: 'Istanbul, Turkey',
  github: 'https://github.com/medo94my',
  // TODO(owner): confirm. LinkedIn blocks automated checks, so neither this nor
  // the older /in/ahmad-tawfiq-8ba147126 could be verified.
  linkedin: 'https://www.linkedin.com/in/medo94my/',
  // Verified: /medo94my 404s, /medo94_my resolves.
  twitter: 'https://twitter.com/medo94_my',
}

const HERO = {
  // The thesis, not a greeting. It is the through-line of the actual work:
  // checkpointing, retry with backoff, healthchecks, idempotent seeds.
  headline: 'I build systems that keep running when things break.',
  subheadline: 'Full-stack · automation · self-hosted infrastructure',
  ctaText: 'See the work',
  ctaUrl: '#work',
}

type SeedProject = {
  title: string
  description: string
  type: string
  tags: string
  featured: boolean
  order: number
  /** "LABEL: value" per line — rendered as the spec grid on each entry. */
  specs?: string
  image?: string
  githubUrl?: string
  liveUrl?: string
}

const PROJECTS: SeedProject[] = [
  // --- Recent work ---
  {
    title: 'Google Maps Scraper',
    description:
      'Playwright-based scraping pipeline that reads search prompts, walks Google Maps ' +
      'listings and writes normalised JSONL. Built for reliability on dynamic pages: ' +
      'resumable checkpointing, exponential back-off retries, bounded concurrency and ' +
      'global deduplication on name plus coordinates plus website host.',
    type: 'Solo',
    tags: 'Python,Playwright,Docker,Web Scraping',
    featured: true,
    order: 0,
    // Every value here is from the repo's README or source — nothing inferred.
    specs: [
      'Year: 2026',
      'Concurrency: bounded prompt workers, default 1',
      'Retry: exponential back-off + jitter, 3 attempts',
      'Dedup: name + lat/lon + website host, global',
      'Resume: append-only JSONL status journal',
      'Extraction: two-stage, collect URLs then open each place',
      'Output: normalised JSONL',
    ].join('\n'),
    githubUrl: 'https://github.com/medo94my/MapsScraper',
  },
  {
    title: 'Screenshot API',
    description:
      'Self-hosted screenshot service in Flask and Playwright. Renders any public URL in ' +
      'headless Chromium and returns PNG or JPEG. Hardened against SSRF with private-IP ' +
      'blocking, DNS-rebinding protection via IP pinning and request interception, plus ' +
      'per-IP rate limiting and a disk cache with TTL.',
    type: 'Solo',
    tags: 'Python,Flask,Playwright,Docker,Security',
    featured: true,
    order: 1,
    specs: [
      'Year: 2026',
      'SSRF: private-IP blocking, DNS validation, IP pinning',
      'Rebinding: request interception on redirects + subresources',
      'Blocked: localhost, AWS + GCP metadata endpoints',
      'Rate limit: 30 req/min per IP, token bucket',
      'Cache: disk, SHA256 key, 300s TTL',
      'Limits: 2 concurrent renders, 8 MB response, 30s nav',
    ].join('\n'),
    githubUrl: 'https://github.com/medo94my/screenshot-api',
  },
  {
    title: 'Crawl4AI Root Cause Analysis',
    description:
      'Automated triage pipeline for an open-source project’s issue tracker. Polls GitHub ' +
      'issues, matches them against known bug patterns, locates the cause by walking the ' +
      'AST, generates a candidate patch with tests and opens a pull request — with ' +
      'confidence thresholds keeping a human in the loop.',
    type: 'Solo',
    tags: 'Python,GitHub API,AST,Automation',
    featured: false,
    order: 2,
    specs: [
      'Year: 2026',
      'Ingest: polls the issue tracker every 5 minutes',
      'Match: keyword + code-snippet patterns, scored',
      'Locate: AST walk to file, function and line',
      'Output: patch + generated tests, opened as a PR',
      'Gate: <60% flag only, 60–80% draft, >80% auto + review',
    ].join('\n'),
    githubUrl: 'https://github.com/medo94my/crawl4ai-root-cause-analysis',
  },

  // --- Earlier work ---
  {
    title: 'Martify — Online Grocery',
    description:
      'Final-year project: a multi-vendor grocery marketplace letting customers order from ' +
      'several local shops in one basket and have it delivered. Covers the storefront, ' +
      'cart and checkout, vendor catalogue management and order tracking.',
    type: 'Solo',
    tags: 'PHP,Laravel,MySQL,E-commerce',
    featured: false,
    order: 3,
    specs: ['Year: 2020', 'Role: solo, final-year project'].join('\n'),
    githubUrl: 'https://github.com/medo94my/martify-v1.2',
    // The martifyapp.herokuapp.com demo died with Heroku's free tier.
  },
  {
    title: 'Bookify — Online Bookstore',
    description:
      'Online bookstore with catalogue browsing, search and filtering, a persistent cart ' +
      'and checkout. React front end against a Flask and MongoDB API.',
    type: 'Team',
    tags: 'React,Python,Flask,MongoDB',
    featured: false,
    order: 4,
    specs: ['Year: 2022', 'Role: team'].join('\n'),
    image: '/projects/bookify.webp',
    githubUrl: 'https://github.com/medo94my/E-commerce_front_end',
    liveUrl: 'https://sprightly-smakager-12110c.netlify.app',
  },
  {
    title: 'Guess Number Game',
    description:
      'Mastermind-style number guessing game. Players deduce a generated number from ' +
      'per-round feedback and earn points, with scores persisted across sessions.',
    type: 'Team',
    tags: 'JavaScript,Python,Flask,MongoDB',
    featured: false,
    order: 5,
    specs: ['Year: 2019', 'Role: team'].join('\n'),
    image: '/projects/guess-game.webp',
    githubUrl: 'https://github.com/medo94my/game-dev',
    // mastermind-me.herokuapp.com is dead.
  },
  {
    title: 'GIS Mapping Project',
    description:
      'Interactive geospatial web app built with Flask and Folium. Renders location ' +
      'datasets as layered, filterable maps in the browser with clustered markers and ' +
      'per-layer toggles.',
    type: 'Solo',
    tags: 'Python,Flask,Folium,GIS',
    featured: false,
    order: 6,
    specs: ['Year: 2020', 'Role: solo', 'Source: private repository'].join('\n'),
    // TODO(owner): medo94my/gis-Project is private — make it public to link it.
    // maps-dev.herokuapp.com is dead.
  },
]

// No `icon` and no `level`. The emoji were standing in for iconography and read
// as a hobby project, and self-assessed percentages ("HTML 95%") are the single
// clearest amateur tell on a developer portfolio — unverifiable, and a reader
// who disagrees with one number distrusts the rest. The page now lists what is
// used, grouped, and lets the project entries carry the evidence.
const SKILLS = [
  { name: 'TypeScript', category: 'Languages', order: 0 },
  { name: 'Python', category: 'Languages', order: 1 },
  { name: 'PHP', category: 'Languages', order: 2 },
  { name: 'JavaScript', category: 'Languages', order: 3 },
  { name: 'SQL', category: 'Languages', order: 4 },

  { name: 'Next.js', category: 'Frontend', order: 5 },
  { name: 'React', category: 'Frontend', order: 6 },
  { name: 'Tailwind CSS', category: 'Frontend', order: 7 },

  { name: 'Flask', category: 'Backend', order: 8 },
  { name: 'Django', category: 'Backend', order: 9 },
  { name: 'Laravel', category: 'Backend', order: 10 },
  { name: 'Node.js', category: 'Backend', order: 11 },

  { name: 'PostgreSQL', category: 'Data', order: 12 },
  { name: 'MySQL', category: 'Data', order: 13 },
  { name: 'MongoDB', category: 'Data', order: 14 },
  { name: 'Prisma', category: 'Data', order: 15 },

  { name: 'Docker', category: 'Infrastructure', order: 16 },
  { name: 'Traefik', category: 'Infrastructure', order: 17 },
  { name: 'Playwright', category: 'Infrastructure', order: 18 },
  { name: 'Git', category: 'Infrastructure', order: 19 },
]

// Named as the stages of a real engagement, in the order they happen — which is
// what makes numbering them meaningful rather than decorative.
const SERVICES = [
  {
    title: 'Scoping and architecture',
    description:
      'Working out what to build and what to leave out, then choosing a stack that fits the problem, the budget and whoever has to maintain it afterwards.',
    order: 0,
  },
  {
    title: 'Build',
    description:
      'Implementation end to end — data model, API, interface — with the failure cases handled rather than discovered in production.',
    order: 1,
  },
  {
    title: 'Ship and keep it running',
    description:
      'Containerised deploys, migrations that replay safely, and enough logging to answer the question the next time something breaks.',
    order: 2,
  },
]

async function main() {
  console.log('Seeding portfolio content...')

  // Credentials come from the environment so they are never in source control.
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set. See .env.example.'
    )
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: ABOUT.name,
    },
  })
  console.log('✓ Admin user:', user.email)

  await prisma.hero.upsert({
    where: { id: HERO_ID },
    update: HERO,
    create: { id: HERO_ID, ...HERO },
  })
  console.log('✓ Hero section')

  await prisma.about.upsert({
    where: { id: ABOUT_ID },
    update: ABOUT,
    create: { id: ABOUT_ID, ...ABOUT },
  })
  console.log('✓ About section')

  for (const project of PROJECTS) {
    await prisma.project.upsert({
      where: { title: project.title },
      update: project,
      create: project,
    })
  }
  console.log(`✓ Projects (${PROJECTS.length})`)

  // Skills and services are an authoritative curated list, so the seed prunes
  // rows it no longer contains. Without this, renaming a category leaves the
  // old row orphaned and the page renders both — which is exactly what happened
  // when "Frontend/Backend/Tools" became "Languages/Frontend/Data/…".
  // Projects are deliberately NOT pruned: those are the owner's own additions.
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { name_category: { name: skill.name, category: skill.category } },
      update: skill,
      create: skill,
    })
  }
  const staleSkills = await prisma.skill.deleteMany({
    where: { NOT: SKILLS.map((s) => ({ name: s.name, category: s.category })) },
  })
  console.log(
    `✓ Skills (${SKILLS.length}${staleSkills.count ? `, pruned ${staleSkills.count}` : ''})`
  )

  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { title: service.title },
      update: service,
      create: service,
    })
  }
  const staleServices = await prisma.service.deleteMany({
    where: { title: { notIn: SERVICES.map((s) => s.title) } },
  })
  console.log(
    `✓ Services (${SERVICES.length}${staleServices.count ? `, pruned ${staleServices.count}` : ''})`
  )

  console.log('\n✅ Seed complete.')
  console.log(`   Sign in at /admin/login as ${adminEmail}`)
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
