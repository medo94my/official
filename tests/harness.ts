/**
 * The whole test framework.
 *
 * `ok(name, condition, detail)` — that is the entire API. Everything under test
 * in this directory is a pure function, so assertions are the only primitive
 * needed, and a passing assertion prints nothing: a run that says nothing but
 * the total is a run worth trusting at a glance.
 */

let passed = 0
let failed = 0

export function resetHarness() {
  passed = 0
  failed = 0
}

export function total() {
  return passed + failed
}

export function failures() {
  return failed
}

/** One assertion. `detail` is printed only on failure, so pass it the actual value. */
export function ok(name: string, condition: boolean, detail = '') {
  if (condition) {
    passed++
    return
  }
  failed++
  console.log(`  \x1b[31mFAIL\x1b[0m  ${name}${detail ? `  \x1b[2m→ ${detail}\x1b[0m` : ''}`)
}

/** A heading, so a failure can be located without counting. */
export function section(name: string) {
  console.log(`  \x1b[2m${name}\x1b[0m`)
}

/** True when `fn` throws. Clearer at the call site than a bare try/catch. */
export function throws(fn: () => unknown) {
  try {
    fn()
    return false
  } catch {
    return true
  }
}
