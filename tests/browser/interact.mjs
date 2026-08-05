import { BASE, launch, reporter } from './launch.mjs'

/** Behaviour a static check cannot see: keyboard, theme, navigation, links. */

const { check, finish } = reporter()
const browser = await launch()

// ── The skip link ─────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.keyboard.press('Tab')

  const first = await page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      text: el.textContent?.trim(),
      href: el.getAttribute('href'),
      // A skip link that is still off-screen while focused is no skip link.
      visible: r.width > 0 && r.height > 0 && r.top > -10,
    }
  })
  check('the skip link is the first tab stop', /skip/i.test(first?.text ?? ''), JSON.stringify(first))
  check('the skip link is visible when focused', first?.visible === true)
  check(
    'the skip link target exists',
    first?.href
      ? await page.evaluate((h) => !!document.querySelector(h), first.href)
      : false,
    String(first?.href),
  )
  await ctx.close()
}

// ── Theme: it toggles, it persists, and it never flashes ──────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })

  const before = await page.evaluate(() => document.documentElement.dataset.theme ?? null)
  const toggle = page.locator('button[aria-label*="theme" i], button[title*="theme" i]').first()
  check('the theme toggle is present and labelled', (await toggle.count()) > 0)

  await toggle.click()
  await page.waitForTimeout(400)
  const after = await page.evaluate(() => document.documentElement.dataset.theme ?? null)
  check('the toggle changes the theme', before !== after, `${before} -> ${after}`)

  await page.reload({ waitUntil: 'networkidle' })
  check(
    'the choice survives a reload',
    (await page.evaluate(() => document.documentElement.dataset.theme ?? null)) === after,
  )
  await ctx.close()
}

{
  // The hard case for a flash: the OS says light and the visitor chose dark.
  // If the choice is applied after first paint, one cream frame is rendered
  // and then snaps to onyx.
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, colorScheme: 'light' })
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('portfolio-theme', 'dark')
    } catch {}
  })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'commit' })

  const frames = []
  for (let i = 0; i < 10; i++) {
    frames.push(await page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    await page.waitForTimeout(25)
  }
  const light = frames.filter((f) => f.includes('236, 228, 210'))
  check('no light frame before the dark theme applies', light.length === 0, `${light.length} of ${frames.length}`)
  await ctx.close()
}

// ── Mobile navigation ─────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })

  const trigger = page.locator('header button[aria-expanded]').first()
  check('the nav trigger exposes aria-expanded', (await trigger.count()) > 0)
  check('the nav starts collapsed', (await trigger.getAttribute('aria-expanded')) === 'false')

  await trigger.click()
  await page.waitForTimeout(400)
  check('the nav opens', (await trigger.getAttribute('aria-expanded')) === 'true')

  // Counted document-wide: the panel is rendered outside <header>.
  const links = await page.locator('a:visible').count()
  check('the nav links are reachable when open', links > 3, `${links} visible links`)

  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  check('Escape closes the nav', (await trigger.getAttribute('aria-expanded')) === 'false')
  await ctx.close()
}

// ── Forms and focus ───────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })

  const unlabelled = await page.evaluate(() =>
    Array.from(document.querySelectorAll('form input, form textarea, form select'))
      .filter((f) => f.type !== 'hidden')
      .filter(
        (f) =>
          !(f.id && document.querySelector(`label[for="${CSS.escape(f.id)}"]`)) &&
          !f.getAttribute('aria-label') &&
          !f.closest('label'),
      )
      .map((f) => f.name || f.id || f.type),
  )
  check('every form field has a real label', unlabelled.length === 0, unlabelled.join(', '))

  const noRing = await page.evaluate(() => {
    const bad = []
    const els = Array.from(
      document.querySelectorAll('a[href], button:not([disabled]), input, textarea, select'),
    ).filter((el) => el.offsetParent !== null)
    for (const el of els.slice(0, 80)) {
      el.focus()
      const s = getComputedStyle(el)
      const visible =
        (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) ||
        s.boxShadow !== 'none' ||
        s.textDecorationLine !== 'none'
      if (!visible) bad.push(`${el.tagName}:${(el.textContent || '').trim().slice(0, 20)}`)
    }
    return bad
  })
  check('every focusable element shows a focus indicator', noRing.length === 0, noRing.join(', '))
  await ctx.close()
}

// ── No internal link 404s ─────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const seen = new Set()
  const broken = []

  for (const start of ['/', '/projects', '/blog']) {
    await page.goto(BASE + start, { waitUntil: 'networkidle' })
    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && (h.startsWith('/') || h.startsWith(location.origin))),
    )
    for (const href of hrefs) {
      const url = href.startsWith('http') ? href : BASE + href
      if (seen.has(url)) continue
      seen.add(url)
      const res = await page.request.get(url, { maxRedirects: 3 })
      if (res.status() >= 400) broken.push(`${url} -> ${res.status()}`)
    }
  }
  check(`internal links resolve (${seen.size} checked)`, broken.length === 0, broken.join(', '))
  await ctx.close()
}

await browser.close()
finish()
