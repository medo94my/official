import { ok, section, throws } from './harness'
import {
  assessEvidence, condenseReadme, summariseTree, parseDraftResponse,
  isDraftableField, DRAFTABLE_KEYS, countWords, type RepoEvidence,
} from '@/lib/case-study-draft'


const base = (over: Partial<RepoEvidence> = {}): RepoEvidence => ({
  fullName: 'medo94my/x', description: null, language: null, topics: [],
  readme: null, tree: [], isPrivate: false, ...over,
})

section('the refusal gate')
ok('no README refuses', assessEvidence(base()).sufficient === false)
ok('8-word README refuses',
  assessEvidence(base({ readme: 'A front end for an e-commerce demo site' })).sufficient === false)
ok('77 files + no README still refuses (tree cannot substitute)',
  assessEvidence(base({ tree: Array.from({length:77},(_,i)=>`src/a${i}.js`) })).sufficient === false)
ok('389-word README passes',
  assessEvidence(base({ readme: 'word '.repeat(389) })).sufficient === true)
ok('119 words refuses, 120 passes',
  assessEvidence(base({ readme: 'w '.repeat(119) })).sufficient === false &&
  assessEvidence(base({ readme: 'w '.repeat(120) })).sufficient === true)
const r = assessEvidence(base({ readme: 'only three words' }))
ok('refusal names the repo and the count',
  !r.sufficient && r.reason.includes('medo94my/x') && r.reason.includes('3 word'))

section('forbidden fields can never come back')
for (const forbidden of ['outcome','lessons','problem','audience','myRole','responsibilities','status','title'])
  ok(`${forbidden} is not draftable`, !isDraftableField(forbidden))
ok('exactly five draftable', DRAFTABLE_KEYS.length === 5, `got ${DRAFTABLE_KEYS.length}`)

const sneaky = parseDraftResponse({ fields: {
  approach: { value: 'Uses a worker pool.', evidence: 'README § Concurrency' },
  outcome:  { value: 'Cut costs by 40%.',  evidence: 'README' },
  lessons:  { value: 'I learned a lot.',   evidence: 'README' },
}})
ok('model returning outcome/lessons is dropped',
  sneaky.drafted.length === 1 && sneaky.drafted[0].field === 'approach',
  JSON.stringify(sneaky.drafted.map(d=>d.field)))

section('evidence is mandatory')
const uncited = parseDraftResponse({ fields: {
  approach: { value: 'Plausible but uncited.' },
  context:  { value: 'Cited.', evidence: 'README § What it does' },
}})
ok('value without evidence is dropped',
  uncited.drafted.length === 1 && uncited.drafted[0].field === 'context')
ok('dropped field is reported as declined, not silently missing',
  uncited.declined.some(d => d.field === 'approach'))
ok('null field declines cleanly',
  parseDraftResponse({ fields: { approach: null } }).declined.length === 5)
ok('garbage response does not throw', parseDraftResponse('nonsense').drafted.length === 0)

section('formatting')
const bulleted = parseDraftResponse({ fields: { constraints: {
  value: '- Needs Python 3.11\n* Rate limited to 60/hr\n1. Single region', evidence: 'README § Requirements' }}})
ok('bullet and number prefixes stripped',
  bulleted.drafted[0].value === 'Needs Python 3.11\nRate limited to 60/hr\nSingle region',
  JSON.stringify(bulleted.drafted[0]?.value))

section('condensing')
const withCode = '# T\n\nProse here.\n\n```bash\nnpm install\nnpm run dev\n```\n\nMore prose.'
ok('code fences removed, prose kept',
  condenseReadme(withCode).includes('[code omitted]') &&
  condenseReadme(withCode).includes('More prose') &&
  !condenseReadme(withCode).includes('npm install'))
ok('badge lines removed',
  !condenseReadme('[![CI](https://img.shields.io/x.svg)](https://ci.example)\n\nReal prose.').includes('shields.io'))
ok('long readme truncated', condenseReadme('w '.repeat(20000)).endsWith('[truncated]'))

section('tree summary')
const tree = summariseTree(['README.md','package.json','app/api/x/route.ts','app/api/y/route.ts','lib/a.ts','src/foo.ts'])
ok('root files listed', tree.includes('README.md'))
ok('groups two levels deep', tree.includes('app/api/ (2 files)'), tree)
ok('single-level dir not mangled by filename', tree.includes('lib/ (1 files)') && tree.includes('src/ (1 files)'), tree)
ok('no filename leaks into a directory key', !tree.includes('src/foo.ts/'), tree)
