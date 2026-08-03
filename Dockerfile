# syntax=docker/dockerfile:1

# ---- deps ----------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
COPY prisma ./prisma
# `npm ci` runs the postinstall `prisma generate`, which needs the schema —
# hence copying prisma/ before installing.
RUN npm ci

# ---- builder -------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* is inlined into the client bundle at build time, so these have
# to be present here rather than at runtime.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && npm run build

# ---- runner --------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Prisma's query engine links against OpenSSL; without it the CLI falls back to
# a wrong build and fails at start.
RUN apk add --no-cache libc6-compat openssl

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# `output: 'standalone'` in next.config.js emits a self-contained server with
# only the modules it actually uses.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Image optimisation. Next refuses to resize or re-encode anything in standalone
# mode without this and logs "'sharp' is required" on every request — which it
# was doing, silently serving every screenshot at full size to every phone.
# Copied explicitly because it is a native module: the alpine/musl binary is the
# one built in the deps stage, and it must not be replaced by a host build.
#
# Its exact runtime tree, not a guess: `sharp` requires @img/colour, detect-libc
# and semver, and @img also holds the platform binary. Standalone tracing does
# not pick any of it up because Next resolves sharp at runtime rather than
# importing it.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@img ./node_modules/@img
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/detect-libc ./node_modules/detect-libc
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/semver ./node_modules/semver

# Needed at container start to apply migrations and (optionally) seed. The
# standalone bundle does not include the CLI or the seed's dependencies.
# --chown throughout: the Prisma CLI writes into its own package directory on
# start, so these cannot be left owned by root.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib/migrate-old-data.ts ./lib/migrate-old-data.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib/prisma.ts ./lib/prisma.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin
# tsx + its esbuild backend run the TypeScript seed. Copied explicitly so
# SEED_ON_START never has to reach the network to fetch them.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/resolve-pkg-maps ./node_modules/resolve-pkg-maps

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Uploaded screenshots and clips. Created here, owned by the runtime user, so
# the named volume mounted over it inherits that ownership — Docker seeds an
# empty named volume from the image path, permissions included. Without this the
# volume would be root-owned and every upload would fail with EACCES.
#
# Deliberately not under public/: the standalone server fixes that directory at
# build time and will not serve anything written to it later. These are served
# by app/media/[name]/route.ts.
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
