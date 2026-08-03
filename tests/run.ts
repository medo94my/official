import { readdirSync } from 'fs'
import { join } from 'path'
import { failures, resetHarness, total } from './harness'

/**
 * Runs every `*.test.ts` in this directory and exits non-zero on any failure.
 *
 * No Jest, no Vitest. Everything under test here is pure — no DOM, no network,
 * no database — so a runner would add a config file, a transform pipeline and a
 * few hundred megabytes to do what thirty lines of `tsx` already do. If these
 * tests ever need mocking or fake timers, that trade changes and a real runner
 * becomes worth it.
 */
async function main() {
  const files = readdirSync(__dirname)
    .filter((f) => f.endsWith('.test.ts'))
    .sort()

  let failed = 0
  let ran = 0

  for (const file of files) {
    resetHarness()
    console.log(`\n\x1b[1m${file}\x1b[0m`)
    await import(join(__dirname, file))
    ran += total()
    failed += failures()
  }

  const colour = failed > 0 ? '\x1b[31m' : '\x1b[32m'
  console.log(`\n${colour}${ran - failed}/${ran} assertions passed\x1b[0m`)
  if (failed > 0) console.log(`\x1b[31m${failed} failed\x1b[0m`)

  process.exit(failed > 0 ? 1 : 0)
}

void main()
