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
- **About** — bio, contact details, social links, résumé path
- **Hero** — homepage headline

Changes show up on the homepage immediately — it renders per request.

## Add your résumé

1. Put the PDF in `public/resume/`.
2. Dashboard → **About** → **Resume** → `/resume/your-file.pdf`.

The download button is hidden until that field is set.

## Optional features

Each of these hides itself when unconfigured, so nothing on the page is ever
broken:

| Variable | Enables |
|---|---|
| `OPENAI_API_KEY` | Voice input on the Projects/Services/About forms |
| `NEXT_PUBLIC_EMAILJS_*` | Contact form and idea form (otherwise: mailto link) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Floating WhatsApp button |

`NEXT_PUBLIC_*` values are compiled into the browser bundle, so changing one
needs a rebuild: `docker compose up -d --build`.

### AI voice input

On forms with a microphone button: record, stop, and Whisper transcribes and
rewrites the text for you. Without `OPENAI_API_KEY` the endpoint returns 503
and everything else keeps working.

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
