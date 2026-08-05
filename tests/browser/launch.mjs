import { chromium } from 'playwright-core'

/**
 * Shared launch and reporting for the browser checks.
 *
 * `playwright-core` ships no browsers, so the executable is resolved from the
 * standard cache and can be overridden — see the README for installing one on
 * a host without root.
 */

export const BASE = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function launch() {
  return chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    // No sandbox: these run in containers and CI images as often as on a
    // desktop, and the pages under test are the project's own.
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
}

export function reporter() {
  const results = []
  return {
    check(name, pass, detail = '') {
      results.push({ name, pass, detail })
    },
    /** Prints every result and exits non-zero if any failed. */
    finish() {
      for (const r of results) {
        console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`)
      }
      const failed = results.filter((r) => !r.pass)
      console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
      if (failed.length) process.exitCode = 1
    },
  }
}
