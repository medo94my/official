#!/usr/bin/env bash
#
# Backs up everything this deployment cannot rebuild from git.
#
# Two things, and only two: the Postgres database (every project, post,
# inquiry, skill and encrypted setting) and the `media` volume (uploaded
# screenshots and clips). Both live in Docker volumes, so `docker compose
# down -v` destroys them and nothing else on this host keeps a copy.
#
# Deliberately not included: `.env`. It holds the only key that can decrypt the
# settings in this dump, and writing the two side by side turns one stolen
# archive into a full compromise. Keep it somewhere else, and keep it — a dump
# restored without SETTINGS_KEY leaves every stored secret unreadable.
#
# Usage:
#   scripts/backup.sh [destination-directory]      # default ./backups
#
set -euo pipefail

cd "$(dirname "$0")/.."

DEST="${1:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$DEST"

DB_FILE="$DEST/db-$STAMP.sql.gz"
MEDIA_FILE="$DEST/media-$STAMP.tgz"

if [ -e "$DB_FILE" ] || [ -e "$MEDIA_FILE" ]; then
  echo "refusing to overwrite an existing backup for $STAMP" >&2
  exit 1
fi

if ! docker compose ps --status running --services 2>/dev/null | grep -qx db; then
  echo "the db service is not running — start the stack first" >&2
  exit 1
fi

echo "==> database"
# --clean --if-exists so the dump can be replayed onto a populated database
# without hand-dropping anything first. The credentials come from the
# container's own environment and are never echoed.
docker compose exec -T db sh -c \
  'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip -9 > "$DB_FILE"

# A dump that only failed halfway still produces a file, so check it decompresses
# and contains a table — an empty archive discovered at restore time is worse
# than no archive, because it was trusted.
if ! gzip -t "$DB_FILE" 2>/dev/null || ! gzip -dc "$DB_FILE" | grep -q 'CREATE TABLE'; then
  echo "the database dump is not a valid archive — removing it" >&2
  rm -f "$DB_FILE"
  exit 1
fi

echo "==> uploaded media"
# Read from the volume through a throwaway container: the media volume is
# owned by uid 1001 inside the app image and is not readable from the host.
VOLUME="$(docker compose config --volumes | grep -x media >/dev/null && echo "$(basename "$PWD")_media" || echo media)"
docker run --rm \
  -v "$VOLUME":/m:ro \
  -v "$(cd "$DEST" && pwd)":/backup \
  alpine tar czf "/backup/$(basename "$MEDIA_FILE")" -C /m . 2>/dev/null \
  || echo "    (no media volume yet — skipped)"

echo
echo "wrote:"
ls -lh "$DB_FILE" ${MEDIA_FILE:+"$MEDIA_FILE"} 2>/dev/null | sed 's/^/  /'
echo
cat <<'RESTORE'
To restore onto a running stack:

  gzip -dc backups/db-<stamp>.sql.gz \
    | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

  docker run --rm -v <project>_media:/m -v "$PWD/backups":/backup \
    alpine sh -c 'rm -rf /m/* && tar xzf /backup/media-<stamp>.tgz -C /m'

Settings restored from this dump stay encrypted with the SETTINGS_KEY that was
in .env when it was taken. Restore that key too, or re-enter the secrets in
Settings afterwards.
RESTORE
