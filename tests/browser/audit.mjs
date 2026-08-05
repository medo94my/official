import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { BASE, launch, reporter } from './launch.mjs'

/**
 * WCAG 2.1 A/AA across the public site, in both themes.
 *
 * Both themes, because a contrast failure is a property of a colour *pair*:
 * the footer labels that first failed this measured 4.44:1 in light and dark
 * alike, and a code comment failed only against the recessed ground a <pre>
 * sits on and nowhere else on the site.
 *
 * Reduced motion is forced on. Not to skip the canvases — to stop them, so a
 * contrast sample is taken against a still page rather than a moving one.
 */

const require = createRequire(import.meta.url)
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const PATHS = (process.env.AUDIT_PATHS ?? '/,/projects,/blog,/admin/login').split(',')

const { check, finish } = reporter()
const browser = await launch()

for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme,
    reducedMotion: 'reduce',
  })

  for (const path of PATHS) {
    const page = await context.newPage()
    const consoleErrors = []
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))

    const response = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
    const status = response?.status()

    await page.addScriptTag({ content: AXE })
    const { violations } = await page.evaluate(
      async (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
      TAGS,
    )

    check(`[${theme}] ${path} responds`, status === 200, `status ${status}`)
    check(
      `[${theme}] ${path} has no WCAG A/AA violations`,
      violations.length === 0,
      violations
        .map((v) => `${v.impact} ${v.id} x${v.nodes.length} (${v.nodes[0]?.target.join(' ')})`)
        .join('; '),
    )
    check(`[${theme}] ${path} logs no console errors`, consoleErrors.length === 0, consoleErrors.join(' | '))

    await page.close()
  }
  await context.close()
}

await browser.close()
finish()
