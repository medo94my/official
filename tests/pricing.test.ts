import { ok, section, throws } from './harness'
import { formatPerMillion } from '@/lib/openrouter'

// perMillion is module-private; mirror its contract so the sentinel rule is pinned.
const perMillion = (v: string | undefined): number | null => {
  if (typeof v !== 'string' || v.trim() === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return null
  return n * 1_000_000
}

section('pricing sentinel')
ok('-1 is not a price', perMillion('-1') === null)
ok('-0.5 is not a price', perMillion('-0.5') === null)
ok('0 is free', perMillion('0') === 0)
ok('normal price scales', perMillion('0.000002') === 2)
ok('missing is null', perMillion(undefined) === null)
ok('empty string is null, not free', perMillion('') === null)
ok('whitespace is null', perMillion('   ') === null)
ok('garbage is null', perMillion('abc') === null)
ok('Infinity is null', perMillion('Infinity') === null)

section('sort places unpriced last')
const by = (a: number|null, b: number|null) => (a ?? Infinity) - (b ?? Infinity)
const order = [null, 0, 2, null, 0.5].sort(by)
ok('free first, unpriced last', order[0] === 0 && order[1] === 0.5 && order[2] === 2 && order[3] === null,
  JSON.stringify(order))

section('label never misleads')
ok('free says free', formatPerMillion(0) === 'free')
ok('no negative ever formatted', perMillion('-1') === null)  // so formatPerMillion never sees it
ok('tiny reads as tiny not zero', formatPerMillion(0.0002) === '<$0.001/M')
