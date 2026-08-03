# Quick Start 🚀

## 1. Configure

```bash
cp .env.example .env
```

Fill in at minimum:

- `POSTGRES_PASSWORD` — any strong value
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your dashboard login

## 2. Start

```bash
docker compose up -d --build

# First boot only — loads the starting content
docker compose run --rm app npx tsx lib/migrate-old-data.ts
```

Portfolio: http://localhost:3000 · Dashboard: http://localhost:3000/admin/login

Migrations run automatically on every start. Seeding is a separate one-off —
it overwrites seeded fields, so don't run it after you've edited content.

### Without Docker

Needs Node 18+ and a Postgres instance. Point `DATABASE_URL` at it, then:

```bash
npm install
npx prisma migrate deploy
npx tsx lib/migrate-old-data.ts
npm run dev
```

## 3. Customize

In the dashboard:

- **Projects** — your work
- **Skills** — grouped by category, with levels
- **Services** — what you offer
- **Stats** — the metrics strip (hidden until you add entries)
- **About** — bio, contact details, WhatsApp number, social links, résumé path
- **Hero** — homepage headline

Changes show up on the homepage immediately — it renders per request.

## Add your résumé

1. Put the PDF in `public/resume/`.
2. Dashboard → **About** → **Resume** → `/resume/your-file.pdf`.

The download button is hidden until that field is set.

## Optional features

Each of these hides itself when unconfigured, so nothing on the page is ever
broken:

Most of these are set at **`/admin/dashboard/settings`** rather than in `.env`,
and take effect immediately — no restart, no rebuild.

| Setting | Enables |
|---|---|
| `OPENROUTER_API_KEY` + `MODEL_TEXT` | Case-study drafting from a repository |
| `OPENROUTER_API_KEY` + `MODEL_STT` | Voice input on the Projects/Services/About forms |
| `GITHUB_TOKEN` | Private repositories in the project importer |
| `RESEND_API_KEY` + notify addresses | Email when someone uses the contact form |

The contact form itself needs no configuration — messages are always saved and
readable at **Dashboard → Inbox**. Email notification is the only optional part.

The floating **WhatsApp button** is not configured here either: set
**About → WhatsApp** in the dashboard and it appears immediately.

`NEXT_PUBLIC_*` values are compiled into the browser bundle, so changing one
needs a rebuild: `docker compose up -d --build`. Everything above is read at
runtime.

### AI voice input

On forms with a microphone button: record, stop, and the transcript is tidied
into prose. With no speech-to-text model chosen the endpoint returns 503 and
everything else keeps working.

### Drafting a case study

Edit a project that has a GitHub URL, open **Case study**, and press **Draft
from repository**. It reads the README and drafts five fields, each shown with
the heading it came from. It refuses when the README is too thin to draft from
without inventing, and it never drafts Problem, Outcome, Lessons or your role —
nothing in a repository supports those.

## Troubleshooting

**Port 3000 taken** — set `APP_PORT=3001` in `.env`.

**Reset the database** (destroys all content):
```bash
docker compose down -v && docker compose up -d
docker compose run --rm app npx tsx lib/migrate-old-data.ts
```

**Schema change** — `npx prisma migrate dev --name <what-changed>`, then commit
the generated folder in `prisma/migrations/`.

**Inspect the data** — `npx prisma studio` (uncomment the `db` port mapping in
`docker-compose.yml` first).
