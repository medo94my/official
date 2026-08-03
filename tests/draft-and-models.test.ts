import { ok, section, throws } from './harness'
import { formatPerMillion, MODEL_ROLES, type CatalogueModel } from '@/lib/openrouter'
import {
  assessEvidence, condenseReadme, summariseTree, parseDraftResponse,
  countWords, isDraftableField, DRAFTABLE_KEYS, buildDraftPrompt, type RepoEvidence,
} from '@/lib/case-study-draft'
import { repoIdentity, humanizeRepoName } from '@/lib/repo-import'

section('formatPerMillion')
ok('zero is free', formatPerMillion(0) === 'free', formatPerMillion(0))
ok('sub-milli does not become "0."', formatPerMillion(0.0001) === '<$0.001/M', formatPerMillion(0.0001))
ok('0.15 keeps two places', formatPerMillion(0.15) === '$0.15/M', formatPerMillion(0.15))
ok('0.1 loses padding', formatPerMillion(0.1) === '$0.1/M', formatPerMillion(0.1))
ok('0.001 survives', formatPerMillion(0.001) === '$0.001/M', formatPerMillion(0.001))
ok('2 drops .00', formatPerMillion(2) === '$2/M', formatPerMillion(2))
ok('10 drops .00 without eating the 0', formatPerMillion(10) === '$10/M', formatPerMillion(10))
ok('100 intact', formatPerMillion(100) === '$100/M', formatPerMillion(100))
ok('1.5 keeps the half', formatPerMillion(1.5) === '$1.5/M', formatPerMillion(1.5))
ok('2.0000000000000004 float noise', formatPerMillion(2.0000000000000004) === '$2/M', formatPerMillion(2.0000000000000004))

section('role filters')
const mk = (o: Partial<CatalogueModel>): CatalogueModel => ({
  id: 'x/y', name: 'n', inputs: [], outputs: [], contextLength: null,
  promptPrice: null, completionPrice: null, priceLabel: null, structured: false, ...o,
})
const role = (r: string) => MODEL_ROLES.find(x => x.role === r)!
ok('gpt-audio counts as speech', role('tts').matches(mk({ id: 'openai/gpt-audio', outputs: ['text','audio'] })))
ok('lyria excluded from speech', !role('tts').matches(mk({ id: 'google/lyria-3-pro', outputs: ['audio'] })))
ok('audiogen not mistaken for udio', role('tts').matches(mk({ id: 'acme/audiogen', outputs: ['audio'] })))
ok('text role needs text out', !role('text').matches(mk({ outputs: ['image'] })))
ok('stt role needs audio in', role('stt').matches(mk({ inputs: ['text','audio'], outputs: ['text'] })))
ok('stt rejects audio-out-only', !role('stt').matches(mk({ inputs: ['text'], outputs: ['audio'] })))
// A string compare here is a *type* error, because ModelRole has no 'video'
// member — the absence is enforced at compile time. Widening to string keeps
// the runtime assertion honest without discarding that guarantee.
ok('no video role exists', !MODEL_ROLES.some((r) => (r.role as string) === 'video'))
ok('every role maps to a MODEL_ setting', MODEL_ROLES.every(r => r.settingKey.startsWith('MODEL_')))

section('countWords')
ok('empty is zero', countWords('') === 0)
ok('whitespace only is zero', countWords('   \n\t ') === 0)
ok('newlines split', countWords('a\nb\tc  d') === 4)

section('the gate')
const ev = (o: Partial<RepoEvidence> = {}): RepoEvidence => ({
  fullName: 'o/r', description: null, language: null, topics: [],
  readme: null, tree: [], isPrivate: false, ...o,
})
ok('null readme refuses', !assessEvidence(ev()).sufficient)
ok('whitespace readme refuses', !assessEvidence(ev({ readme: '   \n  ' })).sufficient)
ok('119 refuses', !assessEvidence(ev({ readme: 'w '.repeat(119) })).sufficient)
ok('120 passes', assessEvidence(ev({ readme: 'w '.repeat(120) })).sufficient)
const v = assessEvidence(ev({ readme: 'w '.repeat(500) }))
ok('word count reported', v.sufficient && v.readmeWords === 500, JSON.stringify(v))
const one = assessEvidence(ev({ readme: 'solo' }))
ok('singular word grammar', !one.sufficient && one.reason.includes('1 word —'), !one.sufficient ? one.reason : '')

section('condenseReadme')
ok('unclosed fence does not eat everything',
  condenseReadme('Intro prose.\n\n```bash\nnpm i').includes('Intro prose'))
ok('multiple fences all removed',
  !condenseReadme('a\n```\nx\n```\nb\n```\ny\n```\nc').includes('x'))
ok('inline code preserved', condenseReadme('Use `npm run dev` here.').includes('npm run dev'))
ok('html comment removed', !condenseReadme('<!-- secret -->visible').includes('secret'))
ok('inline image line removed', !condenseReadme('![logo](a.png)\n\nProse').includes('a.png'))
ok('empty string safe', condenseReadme('') === '')
ok('truncation marker only when needed', !condenseReadme('short').includes('[truncated]'))

section('summariseTree')
const t1 = summariseTree(['README.md','app/api/a/route.ts','app/api/b/route.ts','lib/x.ts','src/foo.ts','a/b/c/d/e.ts'])
ok('root file kept', t1.includes('README.md'))
ok('two-level grouping', t1.includes('app/api/ (2 files)'), t1)
ok('one-level dir keeps its name', t1.includes('lib/ (1 files)'), t1)
ok('filename never becomes a dir', !t1.includes('src/foo.ts/'), t1)
ok('deep path truncated to two levels', t1.includes('a/b/ (1 files)'), t1)
ok('empty tree safe', summariseTree([]) === '')

section('parseDraftResponse')
ok('null raw safe', parseDraftResponse(null).drafted.length === 0)
ok('undefined raw safe', parseDraftResponse(undefined).declined.length === 5)
ok('string raw safe', parseDraftResponse('hi').drafted.length === 0)
ok('array raw safe', parseDraftResponse([1,2]).drafted.length === 0)
ok('fields not an object', parseDraftResponse({ fields: 'x' }).drafted.length === 0)
ok('non-string value dropped',
  parseDraftResponse({ fields: { approach: { value: 42, evidence: 'R' } } }).drafted.length === 0)
ok('non-string evidence dropped',
  parseDraftResponse({ fields: { approach: { value: 'v', evidence: 9 } } }).drafted.length === 0)
ok('whitespace-only value dropped',
  parseDraftResponse({ fields: { approach: { value: '   ', evidence: 'R' } } }).drafted.length === 0)
ok('whitespace-only evidence dropped',
  parseDraftResponse({ fields: { approach: { value: 'v', evidence: '  ' } } }).drafted.length === 0)
const forb = parseDraftResponse({ fields: {
  outcome: { value: 'Saved 40%', evidence: 'R' },
  lessons: { value: 'Learned', evidence: 'R' },
  problem: { value: 'It was slow', evidence: 'R' },
  myRole:  { value: 'Lead', evidence: 'R' },
  title:   { value: 'X', evidence: 'R' },
}})
ok('all forbidden fields rejected', forb.drafted.length === 0, JSON.stringify(forb.drafted))
ok('declined lists all five when nothing drafted', forb.declined.length === 5)
const mixed = parseDraftResponse({ fields: {
  approach: { value: '- a\n* b\n1. c\n2) d', evidence: 'R § A' },
  context:  { value: '  padded  ', evidence: 'R § C' },
}})
ok('bullets and numbering stripped',
  mixed.drafted.find(d=>d.field==='approach')!.value === 'a\nb\nc\nd',
  JSON.stringify(mixed.drafted.find(d=>d.field==='approach')!.value))
ok('value trimmed', mixed.drafted.find(d=>d.field==='context')!.value === 'padded')
ok('drafted+declined always totals five', mixed.drafted.length + mixed.declined.length === 5)

section('buildDraftPrompt')
const p = buildDraftPrompt(ev({ readme: 'w '.repeat(200), fullName: 'me/repo', language: 'Go', topics: ['cli'] }))
ok('system forbids invention', /may not add, infer or embellish/i.test(p.system))
ok('system demands null', /return null/i.test(p.system))
ok('system names all five fields', DRAFTABLE_KEYS.every(k => p.system.includes(`"${k}"`)))
ok('system names no forbidden field',
  !['outcome','lessons','myRole','audience','responsibilities'].some(k => p.system.includes(`"${k}"`)))
ok('user carries repo identity', p.user.includes('me/repo'))
ok('user carries language and topics', p.user.includes('Go') && p.user.includes('cli'))
ok('no null lines leaked into user', !p.user.includes('null'))

section('repoIdentity (regression)')
for (const [u, want] of [
  ['https://github.com/medo94my/MapsScraper', 'medo94my/mapsscraper'],
  ['https://github.com/medo94my/MapsScraper/', 'medo94my/mapsscraper'],
  ['https://github.com/medo94my/MapsScraper.git', 'medo94my/mapsscraper'],
  ['https://www.github.com/medo94my/MapsScraper', 'medo94my/mapsscraper'],
  ['https://gitlab.com/medo94my/x', null],
  ['not a url', null],
  ['', null],
] as [string, string|null][]) ok(`repoIdentity ${u || '(empty)'}`, repoIdentity(u) === want, String(repoIdentity(u)))

section('humanizeRepoName (regression)')
for (const [i, o] of [
  ['MapsScraper','Maps Scraper'], ['screenshot-api','Screenshot API'],
  ['martify-v1.2','Martify v1.2'], ['E-commerce_front_end','E-commerce Front End'],
] as [string,string][]) ok(`humanize ${i}`, humanizeRepoName(i) === o, humanizeRepoName(i))
