# Portfolio — Ahmet Yilmaz

Personal portfolio with a self-hosted CMS. The public page is server-rendered
from the database; content is edited through an authenticated dashboard.

## Features

- **Server-rendered** — content is in the initial HTML, so it is indexable
- **Dynamic CMS** — projects, skills, services, stats, about and hero are all editable
- **Authenticated admin** — NextAuth credentials, guarded at the edge by middleware
- **3D hero** — React Three Fiber
- **AI voice input** *(optional)* — Whisper transcribes and rewrites descriptions
- **Contact + idea forms** *(optional)* — EmailJS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **3D / animation**: React Three Fiber, Three.js, Drei, Framer Motion
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js
- **Optional**: OpenAI Whisper, EmailJS

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

Migrations are applied automatically on every start. Seeding is a separate,
explicit command: it overwrites seeded fields with whatever is in the seed
file, so it must not be wired into container startup.

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

All configuration is environment variables — see `.env.example`. Required:
`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `ADMIN_EMAIL` /
`ADMIN_PASSWORD` for the seed (which refuses to run without them).

Everything else is optional, and each feature hides itself when unconfigured
rather than rendering something broken:

| Unset | Effect |
|---|---|
| `OPENAI_API_KEY` | Voice input returns 503; the rest of the dashboard works |
| `NEXT_PUBLIC_EMAILJS_*` | Contact form falls back to a mailto link; idea form is hidden |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp button is hidden |

Note that `NEXT_PUBLIC_*` values are inlined into the client bundle at **build**
time, so changing one requires a rebuild (`docker compose up -d --build`).

## Adding a résumé

1. Put the PDF in `public/resume/`.
2. In the dashboard, set **About → Resume** to its path, e.g. `/resume/cv.pdf`.

The download button stays hidden until that field is set, so it can never 404.
Under Docker, `public/resume` is mounted read-only, so swapping the file does
not need a rebuild.

## Managing content

Sign in at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then edit
Projects, Skills, Services, Stats, About and Hero. Changes appear on the
homepage immediately — the page is rendered per request.

The **Stats** strip stays hidden until you add entries. It is seeded empty on
purpose: those are claims only you can make truthfully.

## Customization

Brand colour and the dark background are in `tailwind.config.ts`:

```ts
colors: {
  primary: '#f0ad4e',
  dark: '#272626',
}
```

The 3D sphere is in `components/Hero3D.tsx`.

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production build and server
- `npm run lint` — ESLint
- `npx prisma studio` — database GUI
- `npx prisma migrate dev --name <name>` — create a migration after a schema change

## Project Structure

```
├── app/
│   ├── api/              # Route handlers (all mutations require auth)
│   ├── admin/            # CMS dashboard
│   ├── page.tsx          # Public portfolio (server component)
│   └── layout.tsx        # Root layout + generated metadata
├── components/
│   └── ui/               # shadcn primitives
├── lib/
│   ├── content.ts        # Server-side reads shared by page and API
│   ├── auth-options.ts   # NextAuth config
│   └── migrate-old-data.ts  # Idempotent content seed
├── prisma/
│   ├── schema.prisma
│   └── migrations/       # Tracked in git
├── middleware.ts         # Guards /admin/dashboard
└── public/
    ├── projects/         # Project screenshots
    └── resume/           # Résumé PDF
```

## Troubleshooting

**Database connection errors** — check `DATABASE_URL`. Under Docker the host is
`db`, not `localhost`; the app waits on the Postgres healthcheck before starting.

**A `NEXT_PUBLIC_*` change had no effect** — those are baked in at build time.
Rebuild.

**Voice input does nothing** — `OPENAI_API_KEY` is unset (the route returns 503)
or the account has no credits.

**Build fails** — remove `.next` and `node_modules`, then `npm install && npm run build`.

## License

MIT
