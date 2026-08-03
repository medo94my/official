# Portfolio — Ahmet Yilmaz

Personal portfolio with a self-hosted CMS. Every public page is server-rendered
from PostgreSQL; content is edited through an authenticated dashboard, so
nothing on the site is hardcoded in a component.

## Features

- **Server-rendered** — content is in the initial HTML, so it is indexable
- **Dynamic CMS** — projects, case studies, experience, skills, services, stats,
  about and hero are all editable at `/admin/dashboard`
- **Case studies** — each project has its own URL at `/projects/<slug>` with
  thirteen optional write-up fields; each hides itself when empty
- **Light and dark themes** — both designed, not one inverted; no flash on load
- **Working contact form** — server-validated, rate-limited, saved to Postgres,
  readable in an admin inbox, with optional email notification
- **Authenticated admin** — NextAuth credentials, guarded at the edge by middleware
- **AI voice input** *(optional)* — dictate a description and have it tidied
- **Case-study drafting** *(optional)* — drafts five case-study fields from a
  project's GitHub README, each shown with the heading it came from. It drafts
  only what the repository supports and refuses when there is too little to go
  on; Problem, Outcome, Lessons and role are never drafted

## Tech stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript (strict)
- **Styling**: Tailwind CSS over CSS custom properties — see *Theming* below
- **Animation**: [`motion`](https://motion.dev) for component transitions,
  GSAP + ScrollTrigger for the scroll rail (loaded only in async chunks)
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js (credentials)
- **Validation**: Zod, shared between the client form and the route handler
- **Models**: OpenRouter — one key in front of every provider, chosen per role
  (text, speech-to-text) from the settings screen rather than in code
- **Optional**: Resend (contact notifications)

## Running it

### With Docker (recommended)

```bash
cp .env.example .env
# Fill in POSTGRES_PASSWORD, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD.
# Generate a secret with: openssl rand -base64 32

docker compose up -d --build

# One-off, first boot only — loads the starting content
docker compose run --rm app npx tsx lib/migrate-old-data.ts
```

The site is on `http://localhost:3000`, the dashboard on `/admin/login`.

Migrations are applied automatically on every container start. Seeding is a
separate, explicit command: it overwrites seeded fields with whatever is in the
seed file, so it must not be wired into startup.

> The seed deliberately writes **no** case-study fields. Its `update` clause
> only sets the keys present in the object, and that absence is what stops a
> re-run erasing prose entered in the dashboard. Do not "tidy" it into
> spreading a defaults object.

### On Netlify

`netlify.toml` configures the Next.js runtime, so a connected site builds with
no extra setup. Set these in the Netlify UI first — the build succeeds without
them, but the site will have no content and no working login:

| Variable | Value |
|---|---|
| `DATABASE_URL` | A hosted Postgres (Neon, Supabase…), with `sslmode=require` |
| `NEXTAUTH_URL` | The site's public URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | The site's public URL (used by the sitemap and OG cards) |

Then seed that database once from your machine, pointing `DATABASE_URL` at it:

```bash
npx prisma migrate deploy
npx tsx lib/migrate-old-data.ts
```

Netlify and the Docker setup are independent deployment paths and can run side
by side — `output: 'standalone'` is applied only outside Netlify, and Prisma
carries a binary target for each.

### Without Docker

Requires Node 18+ and a PostgreSQL instance.

```bash
npm install
cp .env.example .env          # point DATABASE_URL at your database
npx prisma migrate deploy
npx tsx lib/migrate-old-data.ts   # seed content
npm run dev
```

## Configuration

Most configuration is edited at **`/admin/dashboard/settings`** rather than in a
file. A value saved there is stored in the database, overrides the matching
environment variable, and takes effect immediately — no restart, no rebuild. The
screen shows which source each value is coming from, so the precedence is never
a guess.

Secrets saved there are encrypted at rest with AES-256-GCM. Without
`SETTINGS_KEY` the screen still works but refuses to store secrets, rather than
quietly writing API keys into Postgres as plain text where they would end up in
every `pg_dump`.

### Must stay in `.env`

These are needed before the database or the session exists, so they cannot be
moved into the settings screen:

| Variable | Why it cannot move |
|---|---|
| `DATABASE_URL` | Needed to read the settings table |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Validate the session guarding the page that would edit them |
| `NEXT_PUBLIC_SITE_URL` | Inlined into the client bundle at build time |
| `SETTINGS_KEY` | Encrypts everything else — storing it there is circular. `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed-time only. Change the password from Settings → Account instead |

### Settable from either

Environment variables remain the bootstrap and the fallback. Each feature
degrades rather than breaking when its value is absent from both:

| Unset in both | Effect |
|---|---|
| `RESEND_API_KEY` | Messages are still saved and readable in the inbox; no email is sent, and the inbox says so |
| `INQUIRY_NOTIFY_TO` / `INQUIRY_NOTIFY_FROM` | Same as above. `FROM` must be on a Resend-verified domain |
| `OPENROUTER_API_KEY` | Case-study drafting and the voice button report they are unavailable; nothing else changes |
| `MODEL_TEXT` / `MODEL_STT` | Same as above — a key with no model chosen cannot call anything. Set both from Settings → Models |
| `GITHUB_TOKEN` | The project importer shows public repositories only, limited to 60 requests an hour |
| `INQUIRY_IP_SALT` | Rate limiting still works; a random salt is generated per process instead, so stored source hashes no longer correlate across restarts |

The WhatsApp number is not configured here — it lives on the About record, so it
is edited in the dashboard and needs no rebuild.

`NEXT_PUBLIC_*` values are inlined into the client bundle at **build** time, so
changing one requires a rebuild (`docker compose up -d --build`). Everything
else is read at runtime.

## Theming

`app/globals.css` is the single source of truth. Both themes are defined there
as CSS custom properties holding **space-separated RGB channel triplets**:

```css
:root                { --background: 236 228 210; }  /* light */
[data-theme='dark']  { --background:  12  12  14; }  /* dark  */
```

`tailwind.config.ts` maps each to `rgb(var(--x) / <alpha-value>)`, which is what
makes `bg-surface/60` and `text-foreground/85` work. **Do not replace these with
hex strings** — the alpha modifier silently stops applying and every scrim
becomes opaque.

Components use semantic names (`background`, `surface`, `foreground`, `primary`,
`accent`, `border`), never raw brand colours. Two of the four brand colours fail
contrast in one theme each and have documented derived variants for text roles —
the reasoning and the measured ratios are in `lib/tokens.ts`.

There is intentionally **no `app/loading.tsx`**; see the note in
`app/layout.tsx` before adding one, as it silently breaks 404 status codes.

## Uploaded media

Screenshots and short clips are uploaded per project at
**Projects → edit → Screens and clips**. PNG, JPEG or WebP up to 5 MB; MP4 or
WebM up to 25 MB. A clip should be ten to fifteen seconds, silent, and loop
cleanly — it autoplays when scrolled to and pauses when it leaves the screen.

Alt text is required on images. Without it a screenshot is announced to a screen
reader as nothing at all, and it doubles as the caption underneath.

> **These live in a Docker named volume (`media`), and nothing else backs them
> up.** `docker compose down -v` destroys them along with the database. Back up
> with:
>
> ```bash
> docker run --rm -v official_media:/m -v "$PWD:/backup" alpine \
>   tar czf /backup/media.tgz -C /m .
> ```

They are **not** in `public/`. Next's standalone server fixes that directory at
build time and will not serve anything written to it afterwards — verified, not
assumed — so uploads are served by `app/media/[name]/route.ts` instead. That
route is also where path traversal is stopped: a filename that does not match
the shape the uploader generates never reaches the filesystem.

Deleting media removes the row and the file immediately, but a CDN may keep
serving it for up to an hour (`s-maxage=3600`). If something was published that
should not have been, that is the window.

## Adding a résumé

1. Put the PDF in `public/resume/`.
2. In the dashboard, set **About → Resume** to its path, e.g. `/resume/cv.pdf`.

The download button stays hidden until that field is set, so it can never 404.

> **Swapping the file does need a rebuild.** This previously claimed otherwise.
> `public/resume` is bind-mounted, so the new file reaches the container — but
> Next's standalone server fixes the public directory at build time and returns
> 404 for anything added afterwards. Measured, not assumed. Run
> `docker compose up -d --build` after replacing it, and check the file is
> mode 644: an upload arriving as 600 is unreadable by the container's user.

## Managing content

Sign in at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Changes appear on the site immediately: public reads are cached for 60 seconds,
and every mutating route invalidates that cache on a successful write. Anything
that adds a model must return through `contentChanged()` in `lib/api.ts` rather
than a bare `NextResponse.json`, or edits will appear to do nothing for a minute.

Several sections are absent until you fill them in, which is deliberate — they
are claims only the owner can make truthfully:

| Section | Hidden until |
|---|---|
| Stats strip | at least one stat exists |
| Experience | at least one role exists (seeded empty) |
| Case study page detail | at least one write-up field is filled |
| Résumé buttons | `About → Resume` is set |
| WhatsApp | `About → WhatsApp` is set |

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production build and server
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck
- `npx prisma studio` — database GUI
- `npx prisma migrate dev --name <name>` — create a migration after a schema change

## Project structure

```
├── app/
│   ├── api/                   # Route handlers (all mutations require auth)
│   ├── admin/                 # CMS dashboard
│   ├── projects/[slug]/       # Case-study pages
│   ├── page.tsx               # Homepage (server component; owns all data access)
│   ├── layout.tsx             # Root layout, metadata, no-JS reveal fallback
│   ├── icon.svg               # Favicon; apple-icon.tsx generates the raster
│   ├── opengraph-image.tsx    # Link previews, generated from the About record
│   ├── robots.ts / sitemap.ts / manifest.ts
│   └── error.tsx / global-error.tsx / not-found.tsx
├── components/
│   ├── sections/              # One per homepage section; all server components
│   ├── layout/                # SiteNav, SiteFooter
│   ├── motion/                # Reveal, StaggeredList, ScrollRail, GSAP hook
│   ├── ui/                    # Container, Section, Prose, Button, DefinitionRow
│   └── admin/                 # Dashboard-only client islands
├── lib/
│   ├── content.ts             # Server-side reads + the cached getSiteContent
│   ├── api.ts                 # handleApiError, contentChanged
│   ├── motion.ts              # Every duration, ease, stagger and distance
│   ├── tokens.ts              # Brand hex + the palette accessibility notes
│   ├── schemas/               # Zod schemas shared by client and server
│   └── migrate-old-data.ts    # Idempotent content seed
├── prisma/
│   ├── schema.prisma
│   └── migrations/            # Tracked in git; applied on every container start
├── middleware.ts              # Guards /admin/dashboard
└── public/
    ├── projects/              # Project screenshots
    └── resume/                # Résumé PDF
```

## Troubleshooting

**Database connection errors** — check `DATABASE_URL`. Under Docker the host is
`portfolio-db`, not `db` and not `localhost`: another stack on the shared
`infra-proxy` network already publishes the alias `db`, and a bare `db` there
resolves to a foreign Postgres.

**An edit in the dashboard did not appear** — the save probably failed; check for
a toast. If the save succeeded, the route is likely returning
`NextResponse.json` instead of `contentChanged`.

**A `NEXT_PUBLIC_*` change had no effect** — those are baked in at build time.
Rebuild.

**Voice input does nothing** — no speech-to-text model is chosen in
Settings → Models (the route returns 503), or the OpenRouter key has no credit.

**Voice input returns an unsupported-format error** — browsers record WebM/Opus
(MP4 on Safari), and not every model accepts those. Pick a different
speech-to-text model; the message is the model's own.

**"Draft from repository" refuses** — the repository's README is under 120 words
or missing. That is the gate working: a file tree shows the stack but never the
reasoning, so drafting from one would mean inventing it.

**Contact form succeeds but no email arrives** — expected without
`RESEND_API_KEY`. The message is in `/admin/dashboard/inbox`.

**Build fails** — remove `.next` and `node_modules`, then
`npm install && npm run build`.

## License

MIT
