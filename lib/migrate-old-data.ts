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
  headline: 'Hello, I am Ahmet Yilmaz',
  subheadline: 'Full-Stack Developer',
  ctaText: 'SEE PORTFOLIO',
  ctaUrl: '#portfolio',
}

type SeedProject = {
  title: string
  description: string
  type: string
  tags: string
  featured: boolean
  order: number
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
    // TODO(owner): medo94my/gis-Project is private — make it public to link it.
    // maps-dev.herokuapp.com is dead.
  },
]

// TODO(owner): the level percentages are inherited from the old portfolio and
// are self-assessed. Review them, or consider dropping the numbers entirely.
const SKILLS = [
  { name: 'HTML', category: 'Frontend', level: 95, icon: '📄', order: 0 },
  { name: 'CSS3', category: 'Frontend', level: 90, icon: '🎨', order: 1 },
  { name: 'JavaScript', category: 'Frontend', level: 90, icon: '⚡', order: 2 },
  { name: 'TypeScript', category: 'Frontend', level: 80, icon: '📘', order: 3 },
  { name: 'React', category: 'Frontend', level: 85, icon: '⚛️', order: 4 },
  { name: 'Next.js', category: 'Frontend', level: 80, icon: '▲', order: 5 },

  { name: 'Python', category: 'Backend', level: 90, icon: '🐍', order: 6 },
  { name: 'PHP', category: 'Backend', level: 85, icon: '🐘', order: 7 },
  { name: 'Node.js', category: 'Backend', level: 80, icon: '🟢', order: 8 },

  { name: 'Flask', category: 'Frameworks', level: 90, icon: '🌶️', order: 9 },
  { name: 'Django', category: 'Frameworks', level: 85, icon: '🦄', order: 10 },
  { name: 'Laravel', category: 'Frameworks', level: 80, icon: '🔧', order: 11 },

  { name: 'MySQL', category: 'Database', level: 85, icon: '🗄️', order: 12 },
  { name: 'PostgreSQL', category: 'Database', level: 80, icon: '🐘', order: 13 },
  { name: 'MongoDB', category: 'Database', level: 80, icon: '🍃', order: 14 },

  { name: 'Docker', category: 'Tools', level: 80, icon: '🐳', order: 15 },
  { name: 'Playwright', category: 'Tools', level: 85, icon: '🎭', order: 16 },
  { name: 'Git', category: 'Tools', level: 90, icon: '🌿', order: 17 },
]

const SERVICES = [
  {
    title: 'Technology Planning',
    description: 'Choosing the stack and architecture that actually fit the problem and the budget.',
    icon: '🎯',
    order: 0,
  },
  {
    title: 'UI/UX Design',
    description: 'Designing the interface and building it out as a responsive, accessible front end.',
    icon: '🎨',
    order: 1,
  },
  {
    title: 'Application Development',
    description: 'Building, testing and shipping the application end to end, then keeping it running.',
    icon: '💻',
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

  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { name_category: { name: skill.name, category: skill.category } },
      update: skill,
      create: skill,
    })
  }
  console.log(`✓ Skills (${SKILLS.length})`)

  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { title: service.title },
      update: service,
      create: service,
    })
  }
  console.log(`✓ Services (${SERVICES.length})`)

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
