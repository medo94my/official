import { ok, section, throws } from './harness'
import { checkMedia, sniffMedia, mediaFilename, safeMediaName, MAX_BYTES } from '@/lib/media'

const b = (...n: number[]) => Uint8Array.from(n)
const ascii = (s: string) => Uint8Array.from([...s].map(c => c.charCodeAt(0)))
const cat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length }
  return out
}

const PNG  = b(0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a, 0,0,0,0,0,0,0,0)
const JPEG = b(0xff,0xd8,0xff,0xe0, 0,0,0,0,0,0,0,0,0,0,0,0)
const WEBP = cat(ascii('RIFF'), b(1,2,3,4), ascii('WEBP'), b(0,0,0,0))
const WEBM = b(0x1a,0x45,0xdf,0xa3, 0,0,0,0,0,0,0,0,0,0,0,0)
const MP4  = cat(b(0,0,0,0x20), ascii('ftyp'), ascii('isom'), b(0,0,0,0))
const SVG  = ascii('<svg xmlns="http')
const GIF  = ascii('GIF89a__________')

section('accepted types')
ok('png',  sniffMedia(PNG)?.ext === 'png')
ok('jpeg', sniffMedia(JPEG)?.ext === 'jpg')
ok('webp', sniffMedia(WEBP)?.ext === 'webp')
ok('webm', sniffMedia(WEBM)?.ext === 'webm')
ok('mp4',  sniffMedia(MP4)?.ext === 'mp4')
ok('png is image kind',  sniffMedia(PNG)?.kind === 'image')
ok('mp4 is video kind',  sniffMedia(MP4)?.kind === 'video')

section('refused')
ok('svg refused', sniffMedia(SVG) === null)
ok('gif refused', sniffMedia(GIF) === null)
ok('empty refused', sniffMedia(b()) === null)
ok('RIFF that is not WEBP refused (wav)',
   sniffMedia(cat(ascii('RIFF'), b(1,2,3,4), ascii('WAVE'), b(0,0,0,0))) === null)
ok('ftyp not at offset 4 refused', sniffMedia(cat(ascii('ftyp'), b(0,0,0,0,0,0,0,0,0,0,0,0))) === null)

section('the lie is caught: declared type is never trusted')
const lied = checkMedia(SVG, 100, 'image/png')
ok('svg claiming to be png is refused', !lied.ok)
const svgHonest = checkMedia(SVG, 100, 'image/svg+xml')
ok('svg gets the specific XSS explanation',
   !svgHonest.ok && /script/i.test(svgHonest.reason), !svgHonest.ok ? svgHonest.reason : '')
const mismatch = checkMedia(GIF, 100, 'image/png')
ok('mismatch names what the browser claimed',
   !mismatch.ok && mismatch.reason.includes('image/png'), !mismatch.ok ? mismatch.reason : '')
ok('png really is accepted', checkMedia(PNG, 1000, 'image/png').ok)

section('size caps')
ok('image at cap accepted', checkMedia(PNG, MAX_BYTES.image, 'image/png').ok)
ok('image one byte over refused', !checkMedia(PNG, MAX_BYTES.image + 1, 'image/png').ok)
ok('video may exceed the image cap', checkMedia(MP4, MAX_BYTES.image + 1, 'video/mp4').ok)
ok('video one byte over refused', !checkMedia(MP4, MAX_BYTES.video + 1, 'video/mp4').ok)
ok('empty refused', !checkMedia(PNG, 0, 'image/png').ok)
const big = checkMedia(MP4, MAX_BYTES.video + 1, 'video/mp4')
ok('video message advises on clip length',
   !big.ok && /ten to fifteen seconds/.test(big.reason), !big.ok ? big.reason : '')

section('filenames: no request string reaches the path')
for (const evil of [
  '../../etc/passwd', '..%2f..%2fetc', 'a/b/c', 'a\\b', './../x',
  'CON', '  ', '....', 'nul\0byte', '<script>', 'a'.repeat(300),
]) {
  const name = mediaFilename(evil, 'png')
  ok(`slug "${evil.slice(0,18)}" cannot escape`,
     /^[a-z0-9-]{1,60}\.png$/.test(name) && !name.includes('..') && !name.includes('/'),
     name)
}
ok('two calls never collide', mediaFilename('x','png') !== mediaFilename('x','png'))
ok('empty slug still valid', /^media-[0-9a-f]{12}\.png$/.test(mediaFilename('', 'png')), mediaFilename('', 'png'))
ok('unicode slug reduced', /^[a-z0-9-]+-[0-9a-f]{12}\.webp$/.test(mediaFilename('café—项目', 'webp')), mediaFilename('café—项目','webp'))

section('safeMediaName guards the serving route')
ok('valid name passes', safeMediaName('martify-a1b2c3d4e5f6.webp') === 'martify-a1b2c3d4e5f6.webp')
for (const evil of [
  '../secret.webp', 'a/b.webp', '..%2fx.webp', '.env', 'x.svg', 'x.txt',
  'x.php', 'X.WEBP', 'x', '.webp', 'x..webp/../y.webp', 'a'.repeat(80) + '.webp',
]) ok(`serving rejects "${evil}"`, safeMediaName(evil) === null, String(safeMediaName(evil)))
ok('every generated name is servable',
   Array.from({length: 40}, () => mediaFilename('some-project','mp4')).every(n => safeMediaName(n) === n))
