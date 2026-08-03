import { ok, section, throws } from './harness'
import { parseModelJson, audioFormat, describeFailure, OpenRouterError } from '@/lib/openrouter'
import { UPSTREAM_FAILED } from '@/lib/http'


section('parseModelJson')
ok('plain json', (parseModelJson('{"a":1}') as any).a === 1)
ok('json fence', (parseModelJson('```json\n{"a":1}\n```') as any).a === 1)
ok('bare fence', (parseModelJson('```\n{"a":1}\n```') as any).a === 1)
ok('uppercase fence', (parseModelJson('```JSON\n{"a":1}\n```') as any).a === 1)
ok('leading commentary', (parseModelJson('Here you go:\n{"a":1}') as any).a === 1)
ok('trailing commentary', (parseModelJson('{"a":1}\nHope that helps!') as any).a === 1)
ok('commentary both sides', (parseModelJson('Sure!\n{"a":1}\nDone.') as any).a === 1)
ok('nested braces survive recovery',
  (parseModelJson('note\n{"a":{"b":{"c":2}}}\nend') as any).a.b.c === 2)
ok('whitespace padding', (parseModelJson('\n\n  {"a":1}  \n') as any).a === 1)
ok('realistic drafted shape',
  (parseModelJson('```json\n{"fields":{"approach":{"value":"v","evidence":"R"}}}\n```') as any)
    .fields.approach.value === 'v')
ok('prose only throws', throws(() => parseModelJson('I cannot help with that.')))
ok('empty throws', throws(() => parseModelJson('')))
ok('broken json throws', throws(() => parseModelJson('{"a":')))
ok('throws OpenRouterError with guidance', (() => {
  try { parseModelJson('nope'); return false }
  catch (e) { return e instanceof OpenRouterError && /structured output/.test((e as Error).message) }
})())

section('audioFormat')
for (const [i, o] of [
  ['audio/webm;codecs=opus','webm'], ['audio/webm','webm'], ['video/webm','webm'],
  ['audio/mp4','mp4'], ['audio/x-m4a','mp4'], ['audio/ogg;codecs=opus','ogg'],
  ['audio/wav','wav'], ['audio/x-wav','wav'], ['audio/wave','wav'],
  ['audio/mpeg','mp3'], ['audio/mp3','mp3'], ['audio/flac','flac'],
  ['AUDIO/WEBM','webm'], ['  audio/webm  ','webm'],
  ['','webm'], ['application/octet-stream','webm'],
] as [string,string][]) ok(`audioFormat "${i}"`, audioFormat(i) === o, audioFormat(i))

section('describeFailure')
const m = (s: number, b = '') => describeFailure(s, b)
ok('401 says rejected key', m(401).status === UPSTREAM_FAILED && /rejected the key/i.test(m(401).message))
ok('402 says no credit', /no credit/i.test(m(402).message))
ok('402 distinct from 401', m(402).message !== m(401).message)
ok('404 says choose another model', /no such model/i.test(m(404).message))
ok('429 keeps 429', m(429).status === 429)
ok('500 maps to a pass-through status', m(500).status === UPSTREAM_FAILED)
ok('400 stays client-side', m(400, '{"error":{"message":"bad param"}}').status === 400)
ok('detail extracted from json body',
  /bad param/.test(m(400, '{"error":{"message":"bad param"}}').message),
  m(400, '{"error":{"message":"bad param"}}').message)
ok('non-json body does not crash', m(400, '<html>oops</html>').message.length > 0)
ok('404 detail appended', /gone/.test(m(404, '{"error":{"message":"gone"}}').message))


section('no upstream failure may return 502')
for (const st of [401, 402, 404, 500, 502, 503, 504]) {
  const mapped = describeFailure(st, '')
  ok(`upstream ${st} avoids 502`, mapped.status !== 502, String(mapped.status))
}
ok('rate limit keeps its own status', describeFailure(429, '').status === 429)
