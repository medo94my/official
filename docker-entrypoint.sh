#!/bin/sh
set -e

# Apply any pending migrations before the server accepts traffic. `migrate
# deploy` only replays committed migrations — it never generates or resets, so
# it is safe to run on every start.
echo "==> Applying database migrations"
npx prisma migrate deploy

# Seeding is deliberately NOT done here. It is a one-off:
#
#   docker compose run --rm app npx tsx lib/migrate-old-data.ts
#
# Doing it via an env flag would be sticky — `docker compose restart` reuses
# the environment a container was created with, so the seed would silently
# re-run on every restart and overwrite dashboard edits to seeded fields.

exec "$@"
